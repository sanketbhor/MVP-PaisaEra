-- User-corrected category (persists across reinstall/resync — previously
-- only lived in on-device state and was lost on every fresh fetch) and a
-- soft-delete flag for SMS the parser misread as a real transaction (e.g.
-- a credit-card bill-due reminder). dismissed_at keeps the row (and its
-- sms_hash) around so a later 90-day resync doesn't re-insert the same
-- false positive.

alter table public.transactions
  add column user_category text,
  add column dismissed_at timestamptz;
