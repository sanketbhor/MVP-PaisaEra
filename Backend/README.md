# PaisaEra — Backend

Everything the mobile app talks to that isn't bundled in the app itself.
This folder is documentation and reference material; the backend's actual
managed code lives in `../supabase/` (migrations + edge functions) because
the Supabase CLI requires that exact folder name and location at the project
root — moving it would break `supabase db push` / `supabase functions
deploy`. Think of `Backend/` as the map, `supabase/` as the territory.

## What exists

| Piece | Where | Status |
|---|---|---|
| Postgres schema (`users`, `goals`, `consents`, RLS) | `../supabase/migrations/0001_init.sql` | Written, **not yet run** against the live project |
| Auth (phone/OTP) | Supabase Auth, called from `../src/auth/authService.ts` | Client code real; **Phone provider not yet enabled** on the project |
| AI phrasing edge function | `../supabase/functions/ai-phrase/` | Written, **not yet deployed** |
| Project | `szrxpzxlefrlkbiasvia` (Supabase), `@sammy123/paisaera` (EAS) | Live, empty |

See `deployment.md` for the exact commands to close each of those gaps, and
`schema.md` for the data model in plain language.

## Project identity

- **Supabase project ref:** `szrxpzxlefrlkbiasvia`
- **Supabase URL:** `https://szrxpzxlefrlkbiasvia.supabase.co`
- **EAS project:** `@sammy123/paisaera` (id `5afd6b65-c197-4458-b8da-1d9f8381ab19`)

None of the above are secret — the project ref and URL are meant to be
public (that's what the anon key + RLS are for). What's NOT written down
anywhere in this repo, on purpose: the DB password, the service-role key
(if one is ever generated), and the Gemini API key. Those live only in
`.env` (gitignored, never committed) and in Supabase's own secrets store —
see `deployment.md`.

## Where each credential is supposed to live

| Credential | Lives in | Read by |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` locally, EAS env vars (all 3 profiles) | The app's Supabase client — safe to be public |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` locally, EAS env vars (all 3 profiles) | The app's Supabase client — safe to be public, protected by RLS |
| `DATABASE_URL` | `.env` locally only | Your own terminal (`supabase db push`, `psql`) — **never the app** |
| `GEMINI_API_KEY` | `.env` locally, Supabase Edge Function secrets | `ai-phrase` edge function only — **never the app, never EAS** |

If you ever see `DATABASE_URL` or `GEMINI_API_KEY` show up in an
`EXPO_PUBLIC_`-prefixed variable, in `app.json`, or in a client-side EAS env
var, that's a real bug — those two are structurally not allowed to leave
the server side of this project.

## Why this data model, briefly

`users` / `goals` / `consents` are relational by nature — goals belong to a
user, consent records belong to a user and reference a specific grant.
Postgres with row-level security scoped to `auth.uid()` was chosen over a
document store for exactly that reason; the full reasoning (and the
explicit "not fully settled, Firebase is a reasonable alternative" caveat)
is in `../supabase/README.md`.
