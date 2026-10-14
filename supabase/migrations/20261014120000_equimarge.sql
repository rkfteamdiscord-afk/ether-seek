-- EquiMarge: one structure per account, with its horses, expenses and revenues.
-- Row Level Security makes every row visible to its owner only.

create table if not exists public.structures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade default auth.uid(),
  name text not null default '',
  declared_horse_count integer not null default 0 check (declared_horse_count >= 0),
  activities text[] not null default '{}',
  main_expenses text[] not null default '{}',
  lessons_per_week integer not null default 0 check (lessons_per_week >= 0),
  plan text not null default 'essai' check (plan in ('essai', 'essentiel', 'pro')),
  trial_ends_at date not null default (now() + interval '14 days')::date,
  is_demo boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.horses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  type text not null check (type in ('club', 'pension', 'proprietaire')),
  arrival_date date not null,
  departure_date date,
  monthly_price numeric(10, 2) not null default 0 check (monthly_price >= 0),
  lessons_per_week numeric(5, 1) not null default 0 check (lessons_per_week >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  category text not null check (category in (
    'foin', 'paille', 'granules', 'veterinaire', 'marechal', 'dentiste', 'complements',
    'salaires', 'electricite', 'eau', 'assurance', 'entretien', 'materiel', 'loyer', 'autre'
  )),
  label text not null default '',
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null,
  recurrence text not null check (recurrence in ('mensuelle', 'ponctuelle')),
  end_date date,
  horse_id uuid references public.horses (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.revenues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('cours', 'stages', 'balades', 'competition', 'autres')),
  lesson_format text check (lesson_format in ('forfait', 'carte', 'unite')),
  label text not null default '',
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null,
  recurrence text not null check (recurrence in ('mensuelle', 'ponctuelle')),
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists horses_user_id_idx on public.horses (user_id);
create index if not exists expenses_user_id_date_idx on public.expenses (user_id, date);
create index if not exists expenses_horse_id_idx on public.expenses (horse_id);
create index if not exists revenues_user_id_date_idx on public.revenues (user_id, date);

alter table public.structures enable row level security;
alter table public.horses enable row level security;
alter table public.expenses enable row level security;
alter table public.revenues enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['structures', 'horses', 'expenses', 'revenues'] loop
    execute format('drop policy if exists "Owner reads" on public.%I', t);
    execute format('drop policy if exists "Owner inserts" on public.%I', t);
    execute format('drop policy if exists "Owner updates" on public.%I', t);
    execute format('drop policy if exists "Owner deletes" on public.%I', t);
    execute format(
      'create policy "Owner reads" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Owner inserts" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Owner updates" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "Owner deletes" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- An expense may only point at a horse of the same account.
create or replace function public.check_expense_horse_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.horse_id is not null and not exists (
    select 1 from public.horses h where h.id = new.horse_id and h.user_id = new.user_id
  ) then
    raise exception 'Ce cheval n''appartient pas à votre structure.';
  end if;
  return new;
end;
$$;

drop trigger if exists expenses_horse_owner on public.expenses;
create trigger expenses_horse_owner
  before insert or update on public.expenses
  for each row execute function public.check_expense_horse_owner();
