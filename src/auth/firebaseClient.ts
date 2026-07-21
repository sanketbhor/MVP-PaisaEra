// The one place Firebase's configured-state gets checked. Firebase auto-
// initializes its native app from google-services.json at native build
// time (via the config plugins in app.json) — there's no client-side URL/key
// to construct, unlike supabaseClient.ts. Until that file exists and a
// fresh native build includes it, the native module either won't be
// registered or won't have a default app, so every check here is wrapped
// defensively: this must NEVER throw at import time, since authService.ts
// depends on it to safely fall back to demo mode.
import { getApps } from '@react-native-firebase/app';

export function isFirebaseConfigured(): boolean {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}
