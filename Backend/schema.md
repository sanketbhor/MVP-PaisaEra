# Data model, in plain language

Source of truth is `../supabase/migrations/0001_init.sql` +
`0002_drop_supabase_auth_dependency.sql` — this is a readable companion to
those, not a replacement. If they ever disagree, the SQL files are correct
and this file is stale.

## `users`

One row per signed-up person. Created by `Backend/app/otp_service.py` the
moment someone verifies their OTP for the first time — not by a database
trigger anymore (that was Supabase-Auth-specific and was dropped in
`0002_drop_supabase_auth_dependency.sql`).

| Column | Meaning |
|---|---|
| `id` | A plain server-generated UUID (`gen_random_uuid()`) — no longer tied to any external auth provider's own id |
| `phone_hash` | A salted hash of the phone number (see `Backend/app/security.py::hash_phone`) — **never the raw phone number** anywhere in this system |
| `name` | Collected in onboarding, optional |
| `salary_date` | Day of month (1–31), optional — used to estimate Safe-to-Spend before real transaction history exists |
| `created_at` | Set on first successful OTP verify |

RLS policies still exist on this table (`auth.uid() = id`) but are
vestigial — `Backend/app/` connects directly and does its own
authorization, not through PostgREST/anon-key. They'd only matter again if
the mobile client ever queried this table directly, which it doesn't.

## `otp_verifications`

One row per OTP send attempt — never the destination for a real user's
long-term data, just the short-lived verification record. See
`Backend/app/otp_service.py` for exactly how each column gets used.

| Column | Meaning |
|---|---|
| `id` | Row id |
| `phone_hash` | Same hashing scheme as `users.phone_hash` — lets rate-limiting/cooldown queries look up "recent attempts for this number" without ever storing the raw number |
| `otp_hash` | Argon2 hash of the 6-digit code — never the raw code |
| `expires_at` | `created_at` + 5 minutes (`OTP_EXPIRY_MINUTES`) |
| `attempt_count` | Incremented on every verify attempt against this row; capped at 5 (`OTP_MAX_VERIFY_ATTEMPTS`) |
| `verified_at` | Nullable — set the moment the correct code is entered |
| `created_at` | Set on send; also what the resend-cooldown and hourly-rate-limit checks key off of |

No RLS — this table is never read through PostgREST, only by `Backend/app`'s
own direct Postgres connection.

## `goals`

Zero or more per user. A goal collected during onboarding (just a type —
"trip", "emergency fund", etc.) has `target_amount = null` until the user
sets a real number later; the app deliberately does not fabricate one.

| Column | Meaning |
|---|---|
| `id` | Goal id |
| `user_id` | Owner |
| `goal_type` | e.g. `trip`, `emergency_fund`, `debt`, `big_purchase`, `clarity` |
| `target_amount` | Nullable — see above |
| `created_at` | Set on creation |

RLS: a user can select, insert, and delete only their own goals.

## `consents`

The audit trail — every permission or data-access grant a user makes gets
a row here, including revocations. This is what Settings would eventually
show back to the user as "here's what you've agreed to and when," per the
DPDP-style transparency principle this app is built around.

| Column | Meaning |
|---|---|
| `id` | Consent record id |
| `user_id` | Owner |
| `consent_type` | One of `aa_linked`, `sms_permission`, `notifications` |
| `granted_at` | When the grant happened |
| `revoked_at` | Nullable — set when the user later revokes it; the row is never deleted, so history is preserved |

RLS: a user can select and insert their own consent rows, and update only
to set `revoked_at` — never to un-revoke or alter history.

## What's deliberately not modeled yet

No `transactions`, `bills`, `categories`, or `subscriptions` tables exist
in Postgres yet — those are still mock data in `../src/engine/mockData.ts`
on the client. Real transaction storage is Phase 4+ work (Setu Account
Aggregator integration is still mocked; see the client's honesty guardrail
in `../src/onboarding/buildOnboardingInput.ts`, which deliberately never
invents transaction history for a fresh signup).
