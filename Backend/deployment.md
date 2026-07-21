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
- ✅ Auth switched to Firebase (`src/auth/authService.ts`), demo-mode
  fallback verified live in the browser preview
- ❌ No Firebase project exists yet — no `google-services.json`, so every
  build so far (including the one on your phone) still runs auth in demo
  mode, not against real Firebase
- ❌ Postgres migration not run — `public.users` doesn't exist on the live
  Supabase project yet
- ❌ Postgres ↔ Firebase auth bridge not wired — real writes will hit an
  RLS wall until this is done (see `../supabase/README.md`)
- ❌ `ai-phrase` edge function not deployed, `GEMINI_API_KEY` not set as a
  function secret

## 0. Set up Firebase (dashboard, then one file back into this repo)

1. **console.firebase.google.com → Add project** (free "Spark" plan covers
   phone auth's free tier). Name it anything — `paisaera` is fine.
2. **Build → Authentication → Get started → Sign-in method → Phone** →
   enable it.
3. **Project settings (gear icon) → Add app → Android.** Package name must
   match exactly: `com.paisaera.app`. App nickname optional.
4. On the same screen, add the app's **SHA-1 fingerprint** — Android phone
   auth won't work without it. Get it from the EAS-managed keystore:
   ```
   npx eas-cli credentials --platform android
   ```
   (interactive — select the `development` profile, then "Android
   Keystore: Manage everything needed to build your project" → it prints
   the SHA-1). Paste that into the Firebase console field.
5. Download **`google-services.json`** from that same screen, place it at
   the repo root (`E:\PE\paisaera\google-services.json`) — it's gitignored,
   matching how `.env` is handled, so it needs to reach EAS separately too:
   ```
   npx eas-cli env:create --name GOOGLE_SERVICES_JSON --type file --visibility sensitive --scope project --environment development --environment preview --environment production --value ./google-services.json
   ```
6. Rebuild (step 4 below) — this is a native module, so it can't take
   effect via just editing `.env` or hot-reload like the Supabase keys did.

## 1. Postgres ↔ Firebase bridge (do this before trusting real writes)

Supabase dashboard → your project → **Authentication → Sign In / Providers
→ Third-Party Auth → Add provider → Firebase Auth**, point it at the
Firebase project created above. Once active, update `0001_init.sql`'s RLS
policies to check the Firebase-issued JWT instead of `auth.uid()` — see
`../supabase/README.md` for the two options here (this one, or an
edge-function bridge) and why neither is wired yet.

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

This is the step that actually links Firebase's native module in — until
this runs, the app keeps using demo-mode auth regardless of what's
configured on the Firebase/Supabase side, since `google-services.json` and
the compiled native module only take effect in a fresh native build:

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
