# Deployment runbook

## Status as of last check

- ✅ Both Postgres migrations applied directly against the live database
  (`0001_init.sql`, `0002_drop_supabase_auth_dependency.sql`) — `users` and
  `otp_verifications` tables exist and are correct
- ✅ `Backend/app` live-tested end to end against that database: OTP
  request, 30s resend cooldown, 5/hour rate limit, wrong-code rejection,
  correct-code verify → real user row created → real JWT access + refresh
  tokens issued, and `/auth/refresh` all confirmed working
- ✅ Mobile client (`src/auth/authService.ts` + `apiAuthClient.ts`) wired to
  call this backend for real when `EXPO_PUBLIC_AUTH_API_URL` is set,
  demo-mode fallback otherwise
- ❌ `Backend/app` only runs locally so far (`uvicorn` on this machine) —
  nothing deployed anywhere reachable outside your LAN
- ❌ `EXPO_PUBLIC_AUTH_API_URL` is set to a LAN IP (`http://192.168.1.2:8000`)
  in `.env` and EAS env vars — works for a phone on the same Wi-Fi as this
  machine, breaks the moment either changes networks or this machine is off
- ❌ `SMS_PROVIDER=console` — OTPs are printed to the terminal running
  uvicorn, not actually texted anywhere. `msg91`/`twilio` are stubs (see
  `Backend/app/sms/`)
- ❌ `ai-phrase` edge function not deployed, `GEMINI_API_KEY` not set as a
  function secret (unrelated to auth, still outstanding from earlier)

## Running the backend locally

```
cd Backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
copy .env.example .env      # fill in DATABASE_URL (same as the app's ../.env), generate real JWT_SECRET/PHONE_HASH_PEPPER
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` matters — binding to `127.0.0.1` only would make it
unreachable from a phone on the same network, same reasoning as the Metro
dev server's own LAN-IP setup.

Watch the terminal for `[console-sms] OTP for +91...: 123456` lines — that
line *is* the OTP delivery in local dev.

## Applying migrations

Already done against the live database as of this writing. To redo it (a
fresh project, or after adding more migrations), the Supabase CLI needs
`supabase login` first; since that's interactive, here's the direct
alternative used to apply the two so far — run from `Backend/` with its
`.venv` active:

```
.venv\Scripts\python.exe -c "
import psycopg2, os
from dotenv import load_dotenv
load_dotenv()
conn = psycopg2.connect(os.environ['DATABASE_URL']); conn.autocommit = True
cur = conn.cursor()
for f in ['../supabase/migrations/0001_init.sql', '../supabase/migrations/0002_drop_supabase_auth_dependency.sql']:
    cur.execute(open(f, encoding='utf-8').read())
conn.close()
"
```

(Re-running an already-applied migration will error on `create table` —
that's expected and harmless; it means it already ran.)

## Getting this reachable from anywhere (not just your LAN)

This is the real remaining decision — where `Backend/app` actually lives
long-term. Options, roughly cheapest/simplest to most involved:

1. **Railway / Render / Fly.io** — each has a free or near-free tier, deploys
   straight from this `Backend/` folder (`requirements.txt` + a start
   command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`), and gives
   you a stable public URL to put in `EXPO_PUBLIC_AUTH_API_URL`.
2. **A small VPS** you already have — more control, more to maintain
   (process supervision, TLS, restarts on crash).
3. **Keep it on this machine, exposed via a tunnel** (ngrok, Cloudflare
   Tunnel) for continued local development without a real deploy yet — the
   URL changes every time the tunnel restarts unless you pay for a fixed
   subdomain, so treat this as a dev convenience, not a real answer.

Whichever is chosen, update `EXPO_PUBLIC_AUTH_API_URL` in both `.env` and
EAS env vars (see below) and rebuild.

## Rebuilding the mobile app

`EXPO_PUBLIC_AUTH_API_URL` is an `EXPO_PUBLIC_` var, so unlike the native
Firebase module that was removed, this one **does** take effect via a
normal Metro reload — no native rebuild required just to point at a
different backend URL. A fresh EAS build is only needed for other native
changes, not this one:

```
npx eas-cli build --profile development --platform android
```

## Keeping EAS env vars in sync with `.env`

```
npx eas-cli env:create --name EXPO_PUBLIC_AUTH_API_URL --value "<url>" --visibility plaintext --scope project --environment development --environment preview --environment production --force
```

(same pattern for `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` if those ever change)

Never do this for `DATABASE_URL`, `JWT_SECRET`, `PHONE_HASH_PEPPER`, or
`GEMINI_API_KEY` — see `README.md` for why those stay server-only.
