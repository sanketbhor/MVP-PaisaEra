# PaisaEra — Backend

A homegrown OTP auth service (`app/`) plus reference docs for everything
else the mobile app talks to. The service's own migrations live in
`../supabase/migrations/` alongside the rest of the schema — not because
this backend depends on Supabase's tooling (it connects to Postgres
directly), but because `users`/`otp_verifications` and `goals`/`consents`
share one database, and one migration history is easier to reason about
than two.

## What exists

| Piece | Where | Status |
|---|---|---|
| OTP auth service (FastAPI) | `app/` | **Live-tested end to end** against the real Postgres database — OTP request/cooldown/rate-limit, wrong/right code, user creation, JWT issue + refresh all verified working |
| `users` / `otp_verifications` tables | `../supabase/migrations/0001_init.sql` + `0002_drop_supabase_auth_dependency.sql` | **Applied** to the live database |
| Mobile client wiring | `../src/auth/authService.ts` + `apiAuthClient.ts` | Real HTTP calls to `app/`, with a demo-mode fallback when `EXPO_PUBLIC_AUTH_API_URL` is unset |
| SMS delivery | `app/sms/` | `console` (prints to stdout) working and is what's been tested; `msg91`/`twilio` are clearly-labeled stubs pending real credentials |
| AI phrasing edge function | `../supabase/functions/ai-phrase/` | Written, **not yet deployed** |
| Hosting for `app/` | n/a | **Runs locally only so far** — nothing deployed anywhere reachable outside your LAN. See `deployment.md`. |

## Why homegrown, not Supabase Auth or Firebase Auth

Both were tried first. Supabase Auth's phone provider needs a paid SMS
provider configured before it sends anything — hit `phone_provider_disabled`
on a live device test. Firebase Auth was the next attempt and would have
worked, but was replaced with this instead: full control over the OTP
lifecycle (5-minute expiry, 5 verify attempts, 5 requests/hour, all in
`app/config.py`), no third-party auth-provider dependency, and no bridging
problem to solve between an external identity provider and Postgres RLS —
this backend connects to Postgres directly with its own role and does its
own authorization, so RLS built for a Supabase-issued `auth.uid()` (see
`../supabase/migrations/0001_init.sql`) simply isn't in this backend's path
at all.

## How auth and data fit together

- `app/` owns identity: OTP verification, the `users` row, and JWT issuance.
- `../src/data/*` (goals, consents) still talks to Postgres through
  Supabase's PostgREST/anon-key layer, which — like before — can't
  authenticate as this backend's JWT, so those specific calls still fall
  back to the local demo store. That's an existing, separately-tracked gap,
  not something this auth switch changed for better or worse.
- The two are joined only by `users.id`, a plain UUID now (no more foreign
  key to `auth.users` — see `0002_drop_supabase_auth_dependency.sql`).

## Project identity

- **Postgres/Supabase project ref:** `szrxpzxlefrlkbiasvia` (database only —
  Supabase's own Auth is unused now)
- **EAS project:** `@sammy123/paisaera` (id `5afd6b65-c197-4458-b8da-1d9f8381ab19`)
- **Android package:** `com.paisaera.app`

## Where each credential is supposed to live

| Credential | Lives in | Read by |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | `.env` locally, EAS env vars | The app's Supabase client (goals/consents only now) — safe to be public |
| `EXPO_PUBLIC_AUTH_API_URL` | `.env` locally, EAS env vars | The app's `apiAuthClient.ts` — the base URL is not sensitive, but see `deployment.md` for why it can't just be `localhost` |
| `DATABASE_URL` | `.env` locally, `Backend/.env` | Your terminal (migrations) and `app/config.py` directly — **never the mobile app** |
| `JWT_SECRET`, `PHONE_HASH_PEPPER` | `Backend/.env` only | `app/security.py` — genuinely secret, rotate the dev defaults before this is anything but local testing |
| `GEMINI_API_KEY` | `.env` locally, Supabase Edge Function secrets | `ai-phrase` edge function only — never the app |

If `JWT_SECRET`, `PHONE_HASH_PEPPER`, or `DATABASE_URL` ever show up in an
`EXPO_PUBLIC_`-prefixed variable or in the mobile app's bundle, that's a
real bug — those three are structurally server-only.

## Why this data model, briefly

`users` / `goals` / `consents` are relational by nature — goals belong to a
user, consent records belong to a user and reference a specific grant, and
now `otp_verifications` rows are looked up by the same salted phone hash
`users.phone_hash` already used. Postgres was chosen over a document store
for exactly that reason; see `../supabase/README.md` for the fuller
reasoning and history of this decision.
