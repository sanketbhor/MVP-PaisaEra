# Data model, in plain language

Source of truth is `../supabase/migrations/0001_init.sql` — this is a
readable companion to it, not a replacement. If the two ever disagree,
the SQL file is correct and this file is stale.

## `users`

One row per signed-up person. Created automatically by a database trigger
the moment someone completes phone verification — nothing in the app ever
inserts a row here directly.

| Column | Meaning |
|---|---|
| `id` | Same id as the Supabase Auth user (`auth.users.id`) |
| `phone_hash` | A salted hash of the phone number — **never the raw phone number**. The raw phone lives only in Supabase's own `auth.users` table, which this app's code never reads directly. |
| `name` | Collected in onboarding, optional |
| `salary_date` | Day of month (1–31), optional — used to estimate Safe-to-Spend before real transaction history exists |
| `created_at` | Set on signup |

RLS: a user can read and update only their own row. There's no insert
policy on purpose — rows are only ever created by the trigger.

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
