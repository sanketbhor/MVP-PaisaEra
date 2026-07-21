# PaisaEra — Supabase setup

## Why Supabase (Postgres) over Firebase, and why that's not fully settled

PaisaEra's data is inherently relational — transactions reference categories,
bills and subscriptions reference merchants and renewal cycles, goals
reference users, consent records reference the specific grant they log. That
graph of foreign keys is what a relational database is for. Firestore's
document model would work, but you'd spend real effort re-deriving the joins
Postgres gives you for free, and its security-rule language is a weaker fit
for "a user can only ever see their own rows" than Postgres row-level
security (RLS), which is what `0001_init.sql` uses throughout.

Supabase specifically (vs. self-hosted Postgres) bundles auth, RLS, and the
database itself in one project — useful for a small team, and it maps
cleanly onto DPDP-style data-access control since every table's access rule
lives next to the schema, not in a separate rules file.

**This is a recommendation, not a settled decision.** Firebase Auth is a
perfectly reasonable alternative, particularly if:
- the team already runs Firebase infrastructure elsewhere, or
- Firebase's phone-auth OTP delivery is more reliable for Indian carriers in
  practice than whatever SMS provider gets wired into Supabase (this is
  genuinely worth testing with real numbers before committing — OTP delivery
  reliability varies a lot by provider and circle in India).

If the team picks Firebase instead, the `src/auth` module in this codebase
is the only place that would need to change — `src/data` and the onboarding
UI talk to `authService`'s interface, not to Supabase directly.

## What's real here vs. what needs your project

This repo ships the actual integration code — a real `@supabase/supabase-js`
client, real `auth.signInWithOtp` / `verifyOtp` calls, a real Postgres
migration with RLS. None of it has been run against a live project, because
this build environment has no Supabase credentials. Two things follow:

1. **Without `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` set**
   (see `.env.example`), the app runs in a clearly-labeled **demo mode**:
   OTP send/verify is simulated locally (any 6-digit code works, the UI says
   so), and profile/goal/consent writes go to in-memory storage instead of
   Postgres. This keeps the onboarding flow fully clickable without a
   backend. Look for `isSupabaseConfigured` in `src/auth/supabaseClient.ts`
   — that flag is the seam.
2. **Once you point it at a real project**, every call in `src/auth` and
   `src/data` is genuine and should work as written — but has not been
   exercised against a live database in this session. Test the phone-auth
   round trip with a real number before trusting it in front of users.

## Setup steps (for a real project)

1. Create a project at supabase.com.
2. In **Authentication → Providers**, enable **Phone**, and configure an SMS
   provider (Twilio, MessageBird, or Supabase's built-in options) — phone
   auth does nothing without one configured.
3. Run `supabase/migrations/0001_init.sql` against your project (via the
   Supabase SQL editor, or the Supabase CLI: `supabase db push`).
4. Optionally set `app.phone_pepper` (a server-side secret used to salt the
   phone-number hash in `public.users.phone_hash`) via
   `alter database postgres set app.phone_pepper = '<random-string>';` —
   without it the hash still works, just with a weaker default.
5. Copy `.env.example` to `.env`, fill in your project URL and anon key from
   **Project Settings → API**.
6. Restart the Expo dev server so the new env vars are picked up.
