-- Per-user parsed transactions (from the on-device SMS parser, later also
-- AA pulls). Written and read only by Backend/app's direct Postgres
-- connection — like otp_verifications, RLS is intentionally not enabled.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null,
  type text not null check (type in ('debit', 'credit')),
  merchant text not null,
  occurred_at timestamptz not null,
  source text not null default 'sms',
  -- Stable hash of the originating SMS (sender|timestamp|body) so re-syncing
  -- the same 90-day window never duplicates rows.
  sms_hash text,
  created_at timestamptz not null default now()
);

create unique index transactions_user_sms_hash_idx
  on public.transactions (user_id, sms_hash)
  where sms_hash is not null;

create index transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);
