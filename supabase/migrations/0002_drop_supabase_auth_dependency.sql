-- Auth moved from Supabase Auth to a homegrown OTP service (see
-- Backend/app/). That service issues its own user ids and JWTs, and
-- connects to Postgres directly with its own database role — it never
-- goes through Supabase's PostgREST/anon-key layer, so it does its own
-- authorization in application code rather than relying on these RLS
-- policies. The policies below are left in place as defense-in-depth for
-- if PostgREST/anon-key access is ever reintroduced, but they are no
-- longer load-bearing for the app's normal read/write path.
--
-- public.users can no longer be keyed off auth.users — nothing will ever
-- insert a row there again, since Supabase Auth itself isn't used.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column id set default gen_random_uuid();

-- ── otp_verifications ──────────────────────────────────────────────────
-- One row per OTP send attempt. Never stores the raw phone number or the
-- raw code — phone_hash matches public.users.phone_hash's hashing scheme
-- (see Backend/app/security.py::hash_phone), otp_hash is an argon2 hash of
-- the code (Backend/app/security.py::hash_otp). Rate limiting ("max 5
-- requests/hour") and the resend cooldown are both computed by counting/
-- ordering rows here rather than a separate counter column.
create table public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  phone_hash text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempt_count smallint not null default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index otp_verifications_phone_hash_idx on public.otp_verifications (phone_hash, created_at desc);

-- RLS is intentionally NOT enabled here — this table is never read through
-- PostgREST/anon key, only by Backend/app's own direct Postgres connection,
-- which authenticates as a database role, not a Supabase/Firebase JWT.
