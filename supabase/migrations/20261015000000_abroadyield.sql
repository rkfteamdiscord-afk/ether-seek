-- AbroadYield schema: one document table guarded by row-level security, admin roles,
-- encryption of sensitive financial inputs, an audit log of data edits and lead routing.
-- Apply with `supabase db push` (or paste into the SQL editor). Then:
--   1. create the encryption key:  select vault.create_secret('<32+ random chars>', 'ay_encryption_key');
--   2. make yourself admin:         insert into public.ay_user_roles (user_id, role) values ('<your auth user id>', 'admin');

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- roles
create table if not exists public.ay_user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table public.ay_user_roles enable row level security;
drop policy if exists "read own roles" on public.ay_user_roles;
create policy "read own roles" on public.ay_user_roles for select to authenticated using (user_id = auth.uid());
-- No insert/update/delete policies: roles are granted with the service role or SQL editor only.

create or replace function public.ay_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ay_user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------- documents
create table if not exists public.ay_documents (
  collection text not null,
  id text not null check (char_length(id) between 1 and 200),
  owner_id uuid references auth.users (id) on delete set null,
  data jsonb not null check (pg_column_size(data) < 262144),
  sensitive bytea,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id),
  check (collection in ('countries','cities','config','partners','leads','orders','reports','waitlist','events','blog','audit','unlock_clicks','subscribers','refund_requests'))
);
create index if not exists ay_documents_owner on public.ay_documents (owner_id);
create index if not exists ay_documents_collection_updated on public.ay_documents (collection, updated_at);
alter table public.ay_documents enable row level security;

-- Public content (published data) is readable by anyone.
drop policy if exists "public content" on public.ay_documents;
create policy "public content" on public.ay_documents for select
  using (collection in ('countries','cities','config','blog'));

-- Owners read their own orders, reports, leads, waitlist and refund requests.
-- Orders bought before signing up are matched on the verified account email.
drop policy if exists "owner read" on public.ay_documents;
create policy "owner read" on public.ay_documents for select to authenticated
  using (
    collection in ('orders','reports','leads','waitlist','refund_requests')
    and (owner_id = auth.uid() or lower(data->>'email') = lower(auth.jwt()->>'email'))
  );

-- Anyone may submit events, leads (with consent), waitlist, unlock clicks and subscriptions;
-- signed-in users may file refund requests and save their reports. Orders are written only by
-- the Stripe webhook (service role) — never by the browser.
drop policy if exists "public inserts" on public.ay_documents;
create policy "public inserts" on public.ay_documents for insert
  with check (
    (owner_id is null or owner_id = auth.uid())
    and (
      collection in ('events','waitlist','unlock_clicks','subscribers')
      or (collection = 'leads' and (data->>'consent')::boolean is true)
      or (collection in ('refund_requests','reports') and auth.uid() is not null and owner_id = auth.uid())
    )
  );

drop policy if exists "owner update reports" on public.ay_documents;
create policy "owner update reports" on public.ay_documents for update to authenticated
  using (collection = 'reports' and owner_id = auth.uid())
  with check (collection = 'reports' and owner_id = auth.uid());

-- Admins can do everything.
drop policy if exists "admin all" on public.ay_documents;
create policy "admin all" on public.ay_documents for all to authenticated
  using (public.ay_is_admin()) with check (public.ay_is_admin());

-- ---------------------------------------------------------------- triggers
create or replace function public.ay_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists ay_touch on public.ay_documents;
create trigger ay_touch before update on public.ay_documents for each row execute function public.ay_touch();

-- Sensitive financial inputs in saved reports are encrypted with a key held in Supabase Vault
-- and removed from the plain JSON.
create or replace function public.ay_encryption_key() returns text
language sql stable security definer set search_path = public, vault as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ay_encryption_key' limit 1;
$$;
revoke all on function public.ay_encryption_key() from public, anon, authenticated;

create or replace function public.ay_encrypt_sensitive() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare
  secret jsonb;
  key text;
begin
  -- Only when plain financial fields are present (an update of an already-encrypted row keeps its ciphertext).
  if new.collection <> 'reports' or new.data->'profile' is null
     or not (new.data->'profile' ?| array['income','filingStatus','cashUsd','budgetUsd','usState']) then
    return new;
  end if;
  secret := jsonb_build_object(
    'income', new.data->'profile'->'income',
    'filingStatus', new.data->'profile'->'filingStatus',
    'cashUsd', new.data->'profile'->'cashUsd',
    'budgetUsd', new.data->'profile'->'budgetUsd',
    'usState', new.data->'profile'->'usState'
  );
  key := public.ay_encryption_key();
  if key is null then
    raise exception 'Vault secret ay_encryption_key is missing';
  end if;
  new.sensitive := pgp_sym_encrypt(secret::text, key);
  new.data := jsonb_set(new.data, '{profile}', (new.data->'profile') - 'income' - 'filingStatus' - 'cashUsd' - 'budgetUsd' - 'usState');
  return new;
end $$;
drop trigger if exists ay_encrypt_sensitive on public.ay_documents;
create trigger ay_encrypt_sensitive before insert or update on public.ay_documents
  for each row execute function public.ay_encrypt_sensitive();

-- The owner's reports with the encrypted fields decrypted again.
create or replace function public.ay_my_reports() returns setof jsonb
language sql stable security definer set search_path = public, extensions as $$
  select case
    when d.sensitive is null then d.data
    else jsonb_set(d.data, '{profile}', (d.data->'profile') || pgp_sym_decrypt(d.sensitive, public.ay_encryption_key())::jsonb)
  end
  from public.ay_documents d
  where d.collection = 'reports' and d.owner_id = auth.uid()
  order by d.created_at desc;
$$;
revoke all on function public.ay_my_reports() from public, anon;
grant execute on function public.ay_my_reports() to authenticated;

-- New leads: forced to status "new", consent required, and routed to the first active partner
-- for the category that covers the country (admins can re-route later).
create or replace function public.ay_route_lead() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  partner text;
begin
  if tg_op <> 'INSERT' or new.collection <> 'leads' or public.ay_is_admin() then
    return new;
  end if;
  select p.id into partner from public.ay_documents p
   where p.collection = 'partners'
     and (p.data->>'active')::boolean
     and p.data->>'category' = new.data->>'category'
     and p.data->'countries' ? (new.data->>'countryId')
   order by p.created_at limit 1;
  new.data := new.data || jsonb_build_object('status', 'new', 'partnerId', coalesce(partner, ''));
  return new;
end $$;
drop trigger if exists ay_route_lead on public.ay_documents;
create trigger ay_route_lead before insert on public.ay_documents for each row execute function public.ay_route_lead();

-- Audit log of every change to editable data.
create or replace function public.ay_audit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  actor text;
begin
  rec := coalesce(new, old);
  if rec.collection not in ('countries','cities','config','partners','blog','leads','orders') then
    return null;
  end if;
  actor := coalesce(auth.jwt()->>'email', 'system');
  insert into public.ay_documents (collection, id, data)
  values ('audit', gen_random_uuid()::text, jsonb_build_object(
    'id', gen_random_uuid()::text,
    'at', now(),
    'actor', actor,
    'collection', rec.collection,
    'entityId', rec.id,
    'action', case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' else 'delete' end,
    'summary', lower(tg_op) || ' ' || rec.collection || '/' || rec.id
  ));
  return null;
end $$;
drop trigger if exists ay_audit on public.ay_documents;
create trigger ay_audit after insert or update or delete on public.ay_documents for each row execute function public.ay_audit();

-- ---------------------------------------------------------------- AI usage (rate limiting)
create table if not exists public.ay_ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);
create index if not exists ay_ai_usage_user_at on public.ay_ai_usage (user_id, at);
alter table public.ay_ai_usage enable row level security;
-- Written and read by the assistant Edge Function with the service role only.
