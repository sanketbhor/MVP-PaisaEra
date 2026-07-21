# Deployment runbook

Exact commands to close the remaining gaps between "code is written" and
"backend is actually live." Run all of these from the repo root
(`E:\PE\paisaera`). All commands assume you're logged in
(`npx supabase login`, `npx eas-cli login`) — both CLIs cache the session
locally after that.

## Status as of last check

- ✅ EAS project linked (`@sammy123/paisaera`)
- ✅ `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` set in both
  `.env` (local dev) and EAS env vars (development/preview/production —
  so cloud builds get them automatically, no manual step per build)
- ❌ Postgres migration not run — `public.users` doesn't exist on the live
  project yet
- ❌ Phone auth provider not enabled — real OTP sends currently fail with
  `phone_provider_disabled`
- ❌ `ai-phrase` edge function not deployed, `GEMINI_API_KEY` not set as a
  function secret

## 1. Enable phone auth (dashboard only, no CLI for this part)

Supabase dashboard → your project → **Authentication → Providers → Phone**
→ enable it → configure an SMS provider underneath (Twilio, MessageBird,
Vonage, or Supabase's own). In India specifically, transactional SMS also
needs DLT template registration with the telecom regulator before delivery
actually works — this has its own lead time, budget for it separately from
the technical setup.

## 2. Run the migration

```
npx supabase login
npx supabase link --project-ref szrxpzxlefrlkbiasvia
npx supabase db push
```

Verify it worked:

```
npx supabase db diff
```

should report no pending changes.

## 3. Deploy the AI edge function

```
npx supabase secrets set GEMINI_API_KEY=<your Gemini key> AI_DEFAULT_MODEL=gemini/gemini-2.5-flash AI_MAX_RESPONSE_TOKENS=1000
npx supabase functions deploy ai-phrase
```

Sanity-check it's live:

```
curl -X POST https://szrxpzxlefrlkbiasvia.supabase.co/functions/v1/ai-phrase \
  -H "Authorization: Bearer <anon key>" \
  -H "Content-Type: application/json" \
  -d '{"fact":{"kind":"unknownQuery","confidence":"high","provenance":{},"sourceTab":null,"sourceLabel":""},"personaId":"friend","query":"test"}'
```

A `501 not_configured` response means the secret didn't take — re-check
step 3. A real Gemini response (or a `502 gemini_error` with a Gemini-side
detail message) means it's wired correctly.

## 4. Rebuild the mobile app

The EAS env vars are already set, so this is the only step needed once
1–3 above are done — no new secrets to push:

```
npx eas-cli build --profile development --platform android
```

## Keeping EAS env vars in sync with `.env`

If `.env`'s public values ever change, mirror them to EAS (both places
need to match, they're not linked automatically):

```
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "<url>" --visibility plaintext --scope project --environment development --environment preview --environment production --force
```

(same pattern for `EXPO_PUBLIC_SUPABASE_ANON_KEY`, add `--force` to
overwrite the existing one)

Never do this for `DATABASE_URL` or `GEMINI_API_KEY` — see `README.md` for
why those two never leave the server side.
