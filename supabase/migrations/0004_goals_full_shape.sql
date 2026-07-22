-- Extends goals with the full shape the engine needs to render/reason about
-- a user-created goal (previously only goal_type + target_amount existed,
-- so the rest lived in on-device storage only and never survived a
-- reinstall). Written and read only by Backend/app's direct Postgres
-- connection from here on — same as transactions/otp_verifications, RLS on
-- this table stops mattering once PostgREST is no longer in the path.
alter table public.goals add column if not exists name text;
alter table public.goals add column if not exists emoji text;
alter table public.goals add column if not exists saved_amount numeric(12, 2) not null default 0;
alter table public.goals add column if not exists monthly_contribution numeric(12, 2) not null default 0;
alter table public.goals add column if not exists deadline_date date;
