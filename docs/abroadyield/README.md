# AbroadYield

AbroadYield helps Americans decide where to buy rental property abroad by showing their real
return after foreign taxes **and** US taxes. It lives under `/abroadyield` in this app, next to
the existing studio site, which it does not touch.

## What is where

| Area | Path |
| --- | --- |
| Pages (TanStack Start routes) | `src/routes/abroadyield*.tsx`, `src/routes/abroadyield/` |
| Calculation engine (pure, unit-tested) | `src/abroadyield/engine/` |
| Seed data — **SAMPLE DATA – TO BE VERIFIED** (17 destinations: `countries.ts` + `countries-more.ts`) | `src/abroadyield/data/` |
| Storage/auth adapters (demo + Supabase) | `src/abroadyield/store/` |
| UI components, report, admin | `src/abroadyield/components/` |
| Report assistant (grounded answers) | `src/abroadyield/lib/assistant.ts` |
| Database schema, RLS, encryption, audit | `supabase/migrations/` |
| Stripe, refunds, AI assistant, account deletion | `supabase/functions/` |
| Sitemap generator | `scripts/abroadyield/sitemap.ts` (`bun run ay:sitemap`) |
| Destination photos (Unsplash License, credits inside) | `public/abroadyield/photos/` |
| 9:16 promo film (Remotion project, own `package.json`) | `video/abroadyield-promo/` → `public/abroadyield/video/` |

Routes: `/abroadyield` (landing), `/start` (questionnaire), `/results` (free ranking),
`/report?countries=pt,es` (paid report), `/checkout`, `/account`, `/experts`, `/guides`,
`/guides/:slug`, `/methodology`, `/blog`, `/blog/:slug`, `/legal/:page`, `/admin`.

## Promo film

`video/abroadyield-promo` is a separate Remotion project (not part of the site build). Its
soundtrack is synthesized by `scripts/soundtrack.py` (original, no samples). To re-render:

```bash
cd video/abroadyield-promo && npm install
python3 scripts/soundtrack.py
npx remotion render AbroadYieldPromo out/abroadyield-promo.mp4 --codec=h264
# web copy used by the landing page (720×1280, fast start)
npx remotion ffmpeg -i out/abroadyield-promo.mp4 -vf scale=720:1280 -c:v libx264 -pix_fmt yuv420p \
  -crf 25 -movflags +faststart -c:a aac -b:a 128k ../../public/abroadyield/video/abroadyield-promo.mp4
```

Its figures come from the site's own examples and are labelled as sample data on screen.

A second, 45-second cut (`AbroadYieldPromo45`, sources in `src/v45/`) adds simulated drone shots
and is not used on the site. Before rendering it: `sh scripts/fetch-assets.sh` (downloads the
aerial photos) and `python3 scripts/soundtrack45.py`. Optional narration: with
`ELEVENLABS_API_KEY` set (and `api.elevenlabs.io` reachable), run
`node --experimental-strip-types scripts/voiceover45.ts`, then render again.

A third cut, the ~76-second launch film (`AbroadYieldLaunch`, sources in `src/launch/`), presents
every feature to an English voice-over; its script, on-screen phrases and render steps are in
`video/abroadyield-promo/LAUNCH-SCRIPT.md`. Each shot is timed to its narration line, and the
music (the 45-second track, re-cut by `scripts/soundtrack-launch.py`) follows the edit.

## Two modes

**Demo mode (default, no configuration).** Everything — accounts, purchases, saved reports,
leads, analytics and admin edits — is stored in the visitor's browser. Checkout is simulated
("no card is charged") and the admin panel can be opened with "Open the demo admin". A banner
says so on every page. Use it to try the whole product or to run validation interviews.

**Production mode.** Set these build-time variables and the app switches to Supabase:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
```

Both values are public by design; row-level security protects the data.

## Going live — checklist

1. **Database.** `supabase db push` (or run `supabase/migrations/*.sql` in the SQL editor).
2. **Encryption key** for sensitive financial inputs (income, filing status, cash, budget, state):
   `select vault.create_secret('<long random string>', 'ay_encryption_key');`
3. **First admin:** sign up on `/abroadyield/account`, then
   `insert into public.ay_user_roles (user_id, role) values ('<auth user id>', 'admin');`
4. **Seed the data:** in the admin panel, open each country, review it and click **Save
   country** (and **Save** on tax parameters, settings and partners). Until a country is marked
   verified it keeps the "Sample data – to be verified" banner on the public site.
5. **Stripe:**
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_live_… STRIPE_WEBHOOK_SECRET=whsec_… AY_SITE_URL=https://your-domain
   supabase functions deploy ay-checkout ay-stripe-webhook ay-refund ay-delete-account
   ```
   Add a webhook endpoint `https://<project>.supabase.co/functions/v1/ay-stripe-webhook` for
   `checkout.session.completed` and `charge.refunded`. Turn on "Successful payments" receipts in
   Stripe → Settings → Emails. Create promo codes in Stripe (they are accepted at checkout when
   "Accept Stripe promotion codes" is on in the admin).
6. **AI assistant (optional):** `supabase secrets set GROQ_API_KEY=…` (optionally `AY_AI_MODEL`,
   `AY_AI_BASE_URL` for any OpenAI-compatible endpoint) and deploy `ay-assistant`. Without it the
   assistant still answers from the report data with citations, using the built-in retrieval.
7. **Auth emails:** in Supabase → Authentication → URL configuration, add
   `https://your-domain/abroadyield/account` as a redirect URL (magic links).
8. **Legal:** the Terms, Privacy (CCPA), Cookie, Refund and Partner Disclosure pages are starting
   templates. Have an attorney review them and replace the placeholder contact address.
9. **Data verification:** have a US CPA or enrolled agent verify **Tax parameters**, and a
   researcher verify each country and city. Record who verified and when (the admin's
   "Mark verified" buttons do this).
10. **Sitemap:** `SITE_URL=https://your-domain bun run ay:sitemap` and update `public/robots.txt`.

## Validation mode

Admin → Pricing & settings → **Validation mode**. When ON, "Unlock my full report" records the
click and shows a waitlist form instead of charging; the checkout function also refuses
payments. Clicks and sign-ups appear in Orders & revenue and Analytics.

## The calculation engine

Year-one, in USD, step by step (see `/abroadyield/methodology` for the plain-English version):

```
gross rent − vacancy − management − maintenance − insurance − property tax − HOA = NOI
NOI − local income tax − (US federal after Foreign Tax Credit + NIIT) − state tax = after-tax income
after-tax income − mortgage payments = annual cash flow
```

US federal tax is the *incremental* tax of adding Schedule E income (NOI − interest −
depreciation) on top of the household's income; the Foreign Tax Credit is limited to that US
tax; NIIT is not offset by the credit; most states give no foreign credit. Every rate, bracket,
threshold, depreciation period and treaty note is an editable parameter (Admin → Tax parameters
and each country's local tax section) — nothing is hard-coded.

Run the tests: `bun test` (engine formulas, scoring, assistant guardrails).

## Security notes

- Prices are read by the checkout function from the database, never from the browser.
- Orders are written only by the Stripe webhook (signature-verified); browsers cannot create them.
- Leads require the consent flag (enforced in the database) and are routed server-side.
- Admin rights come from `ay_user_roles`, checked by RLS and by the refund function.
- Every change to countries, cities, tax parameters, settings, partners, blog, leads and orders is
  written to the audit log by a database trigger.
- Analytics events are anonymous (random per-tab session id, no IP, no email).
