// Minimal session shape the rest of the app depends on — deliberately not
// tied to any one backend's own session type, so demo mode (no auth API
// configured) can satisfy the same contract without pretending to be a
// real backend session. accessToken is present only for real sessions —
// callers that need to hit the auth API's other endpoints later read it
// from here rather than authService reaching into module-private state.
export interface AppSession {
  userId: string;
  phone: string;
  isDemo: boolean;
  accessToken?: string;
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
