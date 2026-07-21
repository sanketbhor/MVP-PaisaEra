# PaisaEra — Supabase setup

## Auth is homegrown now — Postgres stays for data

The original design used Supabase Auth for phone/OTP, flagged explicitly as
"a recommendation, not a settled decision." It was then briefly swapped to
Firebase Auth. Both were real, working integrations — Supabase's own phone
provider needed a paid SMS provider configured before it would send
anything at all, which is what motivated trying Firebase. The current
answer is neither: **auth is a homegrown OTP service** (`Backend/app/`),
giving full control over the OTP lifecycle without depending on a
third-party auth provider at all. See `Backend/README.md` for the fuller
reasoning.

**Postgres/Supabase is still the data store** for `users` and, separately,
`goals` / `consents` (`src/data/*`) — the relational reasoning below didn't
change:

PaisaEra's data is inherently relational — goals reference users, consent
records reference the specific grant they log, and now `otp_verifications`
rows are looked up by the same salted phone hash `users.phone_hash` uses.
That graph of foreign keys is what a relational database is for. Firestore's
document model would work, but you'd spend real effort re-deriving the
joins Postgres gives you for free.

## How auth and data fit together now

`Backend/app/otp_service.py` connects to this same Postgres database
**directly** — a normal database role, not through Supabase's
PostgREST/anon-key layer — and owns the `users` table entirely: it creates
the row on first successful OTP verify, and issues its own JWTs. Because it
connects directly, Postgres RLS policies (written for `auth.uid()`, a
Supabase Auth concept) don't apply to it either way; the backend does its
own authorization in Python before it ever runs a query. This is why
`0002_drop_supabase_auth_dependency.sql` drops `users.id`'s foreign key to
`auth.users` and the trigger that used to populate it — nothing will ever
write to Supabase's own `auth.users` table again.

**`goals` and `consents` are a separate, still-open question.** `src/data/*`
still talks to those two tables through Supabase's PostgREST/anon-key
client, which has no way to authenticate as this backend's JWT — so those
specific calls still fall back to the local demo store, exactly as they did
under the Firebase attempt. This wasn't made better or worse by the auth
switch; it's a pre-existing, separately-tracked gap. The honest fix, if
this backend expands its scope: proxy goals/consents through `Backend/app`
too (it already owns a trusted direct Postgres connection), rather than
solving Postgres-RLS-vs-external-JWT bridging a second time.

## What's real here vs. what needs doing

This repo ships the actual integration code — a real Postgres schema
(`0001_init.sql` + `0002_drop_supabase_auth_dependency.sql`, **both applied
to the live database**), a real FastAPI service (`Backend/app/`,
**live-tested end to end** — OTP request/cooldown/rate-limit, verify, user
creation, JWT issue + refresh all confirmed working against this database).
What's still open:

1. `Backend/app` only runs locally so far — see `Backend/deployment.md` for
   hosting options.
2. `goals`/`consents` writes from the mobile client still fall back to the
   demo store, per the still-open question above.
3. Real SMS delivery (`msg91`/`twilio` in `Backend/app/sms/`) is stubbed —
   `console` (prints to the server's own terminal) is what's been tested.

## Setup steps (for a real project)

1. Create a project at supabase.com (or reuse the existing one this app is
   already pointed at).
2. Apply both migrations — see `Backend/deployment.md` for the exact
   commands (direct `psycopg2` execution, since it doesn't require
   `supabase login`).
3. Copy `.env.example` to `.env`, fill in your project URL and anon key
   (**Project Settings → API**) for the `goals`/`consents` client calls, and
   `DATABASE_URL` for `Backend/app`'s direct connection.
4. Set up `Backend/app` per `Backend/deployment.md` — its own `.env` needs
   `DATABASE_URL`, `JWT_SECRET`, and `PHONE_HASH_PEPPER`.
5. Restart the Expo dev server so new env vars are picked up.
