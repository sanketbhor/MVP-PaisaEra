# PaisaEra — Supabase setup

## Auth moved to Firebase — Postgres stays for data

The original design used Supabase Auth for phone/OTP, flagged explicitly as
"a recommendation, not a settled decision." That question is now settled:
**auth is Firebase** (see `src/auth/authService.ts`), chosen for its free
tier and India phone-auth delivery reliability, confirmed by live testing —
Supabase's own phone provider needed a paid SMS provider configured before
it would send anything at all, which Firebase's built-in phone auth avoids.

**Postgres/Supabase is still the data store** for `users` / `goals` /
`consents` (`src/data/*`) — the relational reasoning below didn't change,
only who issues the session:

PaisaEra's data is inherently relational — transactions reference
categories, bills and subscriptions reference merchants and renewal cycles,
goals reference users, consent records reference the specific grant they
log. That graph of foreign keys is what a relational database is for.
Firestore's document model would work, but you'd spend real effort
re-deriving the joins Postgres gives you for free, and its security-rule
language is a weaker fit for "a user can only ever see their own rows" than
Postgres row-level security (RLS), which is what `0001_init.sql` uses
throughout.

## The seam this split relies on — and the gap it currently has

`src/auth` exposes a stable interface (`sendOtp`, `verifyOtp`, `getSession`,
`AppSession`) that the rest of the app depends on, not on Firebase or
Supabase directly — that's exactly what let the auth provider swap without
touching `src/data` or any onboarding screen.

The gap: `0001_init.sql`'s RLS policies check `auth.uid()`, which is
Supabase's own concept — populated only when a request carries a
Supabase-issued session JWT. A Firebase-issued session doesn't have one, so
right now, **real Postgres reads/writes for profile/goals/consents fail
their RLS check** and the app catches that and falls back to the local demo
store (see the try/catch in `src/data/userService.ts` and siblings) rather
than throwing. Two ways to close this gap, neither done yet:

1. **Supabase's native Firebase third-party auth support** — Supabase
   dashboard → Authentication → Sign In / Providers → Third-Party Auth →
   add Firebase, pointing it at the Firebase project ID. Once configured,
   `auth.jwt()` inside RLS policies can read the Firebase-issued token
   directly and policies can check against it instead of `auth.uid()` —
   the cleanest fix, no application code changes needed beyond updating the
   RLS policies themselves.
2. **Route writes through a service-role edge function** (same pattern as
   `supabase/functions/ai-phrase`) that verifies the Firebase ID token
   server-side and writes with elevated privileges, bypassing RLS safely
   because the function itself validates identity. More code, no dashboard
   dependency.

Until one of these is wired, real Postgres calls stay non-fatal but
inert — everything works against the demo store, honestly, with no data
loss (the demo store is a fully functional parallel path, not a stub).

## What's real here vs. what needs your project

This repo ships the actual integration code — a real `@supabase/supabase-js`
client and a real Postgres migration with RLS. Two things follow:

1. **Without `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` set**
   (see `.env.example`), `src/data/*` runs in a clearly-labeled **demo
   mode**: profile/goal/consent writes go to local secure storage instead
   of Postgres. Look for `isSupabaseConfigured` in
   `src/auth/supabaseClient.ts` — that flag is the seam.
2. **Once you point it at a real project and run the migration**, reads
   and simple lookups work; writes still need the RLS gap above closed
   before they'll persist to Postgres instead of falling back.

## Setup steps (for a real project)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` against your project (via the
   Supabase SQL editor, or the Supabase CLI: `supabase db push`).
3. Optionally set `app.phone_pepper` (a server-side secret used to salt the
   phone-number hash in `public.users.phone_hash`) via
   `alter database postgres set app.phone_pepper = '<random-string>';` —
   without it the hash still works, just with a weaker default. Note this
   column is now vestigial for Firebase-authenticated users specifically —
   it was designed around Supabase's own `auth.users.phone`, so revisit it
   once Firebase is the source of truth for phone numbers.
4. Copy `.env.example` to `.env`, fill in your project URL and anon key from
   **Project Settings → API**.
5. Close the RLS gap above (Third-Party Auth or an edge-function bridge)
   before trusting real Postgres writes.
6. Restart the Expo dev server so the new env vars are picked up.

For the Firebase side, see `Backend/deployment.md`.
