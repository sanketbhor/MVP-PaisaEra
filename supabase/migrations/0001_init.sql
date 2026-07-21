-- PaisaEra onboarding data model.
--
-- Auth itself is handled by Supabase Auth (phone/OTP) — auth.users already
-- holds the phone number Supabase needs to send/verify OTPs, and Supabase
-- encrypts that table at rest as a platform default. The public.users row
-- below is our *application* profile: one row per auth.users row, created
-- automatically by the trigger at the bottom the moment someone verifies
-- their OTP for the first time.
--
-- We deliberately do NOT duplicate the raw phone number into public.users.
-- The app never needs to read it back (Supabase Auth already knows who's
-- signed in via the session), so there's no reason to widen where a raw PII
-- value lives. Instead we store a salted, one-way hash — enough to detect
-- "has this phone signed up before" without the app layer ever holding a
-- readable phone number outside auth.users itself.

create extension if not exists pgcrypto;

-- ── users ────────────────────────────────────────────────────────────────
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  phone_hash text not null, -- sha-256(phone || pepper), see handle_new_user() below
  name text,
  salary_date smallint check (salary_date is null or salary_date between 1 and 31),
  created_at timestamptz not null default now()
);

create unique index users_phone_hash_idx on public.users (phone_hash);

alter table public.users enable row level security;

create policy "users can read their own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- No insert policy for users: rows are created only by the trigger below,
-- running as the table owner, never directly by a client.

-- ── goals ───────────────────────────────────────────────────────────────
-- The single optional goal collected during onboarding. The main app's
-- richer goal-tracking (progress, deadlines, multiple goals) is a product
-- surface on top of this same table — onboarding just writes the first row.
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  goal_type text not null,
  target_amount numeric(12, 2),
  created_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals (user_id);

alter table public.goals enable row level security;

create policy "users can read their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- ── consents ────────────────────────────────────────────────────────────
-- The DPDP-style audit trail: one row per grant. A later revoke does NOT
-- delete the row — it sets revoked_at — so the log stays a complete history
-- a user can review in Settings, not just a snapshot of current state.
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  consent_type text not null check (consent_type in ('aa_linked', 'sms_permission', 'notifications')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index consents_user_id_idx on public.consents (user_id);

alter table public.consents enable row level security;

create policy "users can read their own consents"
  on public.consents for select
  using (auth.uid() = user_id);

create policy "users can insert their own consents"
  on public.consents for insert
  with check (auth.uid() = user_id);

create policy "users can revoke their own consents"
  on public.consents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── auto-create the profile row on first sign-in ──────────────────────────
-- Supabase Auth writes to auth.users the moment OTP verification succeeds.
-- This trigger mirrors that into public.users so the app never has to do a
-- separate "create my profile" round-trip — by the time the client gets a
-- session back, the row already exists and RLS-protected reads work.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, phone_hash)
  values (new.id, encode(digest(coalesce(new.phone, '') || current_setting('app.phone_pepper', true), 'sha256'), 'hex'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
