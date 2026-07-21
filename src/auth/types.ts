// Minimal session shape the rest of the app depends on — deliberately not
// re-exporting Supabase's full Session type, so demo mode (no Supabase
// project configured) can satisfy the same contract without pretending to
// be a real Supabase session.
export interface AppSession {
  userId: string;
  phone: string;
  isDemo: boolean;
}

export type OtpSendResult =
  | { ok: true; cooldownSeconds: number; demoCode?: string }
  | { ok: false; error: 'rate_limited'; retryAfterSeconds: number }
  | { ok: false; error: 'invalid_phone' }
  | { ok: false; error: 'unknown'; message: string };

export type OtpVerifyResult =
  | { ok: true; session: AppSession }
  | { ok: false; error: 'invalid_code' }
  | { ok: false; error: 'expired_code' }
  | { ok: false; error: 'unknown'; message: string };
