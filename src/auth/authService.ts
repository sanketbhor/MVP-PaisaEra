// Phone/OTP auth. Every function here has a real Firebase code path and a
// demo-mode fallback (see isFirebaseConfigured) — the fallback exists so the
// onboarding flow is fully testable without google-services.json / a native
// build that includes it, and it deliberately mirrors the same shape
// (cooldowns, rate limits, expiry) a real backend enforces, rather than
// just always succeeding.
//
// Switched from Supabase Auth to Firebase Auth for phone/OTP (see
// supabase/README.md — this was always flagged as "recommendation, not
// settled," and Firebase's free tier + India SMS delivery reliability won
// out). Supabase Postgres remains the data store for users/goals/consents
// (src/data/*) — that reasoning didn't change, only who issues the session.
import { getAuth, onAuthStateChanged, signInWithPhoneNumber, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import type { ConfirmationResult, User } from '@react-native-firebase/auth';
import { kvStore } from '../storage/kvStore';
import { isFirebaseConfigured } from './firebaseClient';
import type { AppSession, OtpSendResult, OtpVerifyResult } from './types';

export const RESEND_COOLDOWN_SECONDS = 30;
export const DEMO_OTP_CODE = '123456';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SENDS = 5;
const DEMO_SESSION_KEY = 'paisaera-demo-session';

interface DemoOtpRecord {
  sentAt: number;
  sendCount: number;
  windowStart: number;
}

// In-memory only — a demo run doesn't need this to survive a reload, and
// there's no backend in demo mode to persist it in anyway.
const demoOtpByPhone = new Map<string, DemoOtpRecord>();

// Firebase's confirm-the-code step needs the confirmation object sendOtp
// received back from signInWithPhoneNumber — the app's sendOtp/verifyOtp
// contract is otherwise stateless (matching how Supabase's server-tracked
// OTP worked), so that object is held here between the two calls rather
// than threaded through every screen.
let pendingConfirmation: ConfirmationResult | null = null;

function normalizePhone(localNumber: string): string {
  return `+91${localNumber.replace(/\D/g, '')}`;
}

export function isValidIndianMobile(localNumber: string): boolean {
  return /^[6-9]\d{9}$/.test(localNumber.replace(/\D/g, ''));
}

export async function sendOtp(localNumber: string): Promise<OtpSendResult> {
  if (!isValidIndianMobile(localNumber)) {
    return { ok: false, error: 'invalid_phone' };
  }
  const phone = normalizePhone(localNumber);

  if (isFirebaseConfigured()) {
    try {
      pendingConfirmation = await signInWithPhoneNumber(getAuth(), phone);
      return { ok: true, cooldownSeconds: RESEND_COOLDOWN_SECONDS };
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/too-many-requests') {
        return { ok: false, error: 'rate_limited', retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
      }
      if (code === 'auth/invalid-phone-number') {
        return { ok: false, error: 'invalid_phone' };
      }
      return { ok: false, error: 'unknown', message: (err as Error).message ?? 'Unknown error' };
    }
  }

  const now = Date.now();
  const prev = demoOtpByPhone.get(phone);
  const withinWindow = !!prev && now - prev.windowStart < RATE_LIMIT_WINDOW_MS;
  if (withinWindow && prev!.sendCount >= RATE_LIMIT_MAX_SENDS) {
    const retryAfterSeconds = Math.ceil((prev!.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { ok: false, error: 'rate_limited', retryAfterSeconds };
  }
  demoOtpByPhone.set(phone, {
    sentAt: now,
    sendCount: withinWindow ? prev!.sendCount + 1 : 1,
    windowStart: withinWindow ? prev!.windowStart : now,
  });
  return { ok: true, cooldownSeconds: RESEND_COOLDOWN_SECONDS, demoCode: DEMO_OTP_CODE };
}

export async function verifyOtp(localNumber: string, code: string): Promise<OtpVerifyResult> {
  const phone = normalizePhone(localNumber);

  if (isFirebaseConfigured()) {
    if (!pendingConfirmation) {
      return { ok: false, error: 'unknown', message: 'OTP kabhi bheja hi nahi gaya — pehle bhejo.' };
    }
    try {
      const credential = await pendingConfirmation.confirm(code);
      pendingConfirmation = null;
      if (!credential?.user) {
        return { ok: false, error: 'unknown', message: 'No user returned' };
      }
      return { ok: true, session: { userId: credential.user.uid, phone, isDemo: false } };
    } catch (err) {
      const fcode = (err as { code?: string }).code ?? '';
      if (fcode === 'auth/code-expired') return { ok: false, error: 'expired_code' };
      if (fcode === 'auth/invalid-verification-code') return { ok: false, error: 'invalid_code' };
      return { ok: false, error: 'unknown', message: (err as Error).message ?? 'Unknown error' };
    }
  }

  const record = demoOtpByPhone.get(phone);
  if (!record) {
    return { ok: false, error: 'unknown', message: 'OTP kabhi bheja hi nahi gaya — pehle bhejo.' };
  }
  if (Date.now() - record.sentAt > OTP_EXPIRY_MS) {
    return { ok: false, error: 'expired_code' };
  }
  if (code !== DEMO_OTP_CODE) {
    return { ok: false, error: 'invalid_code' };
  }
  const session: AppSession = { userId: `demo-${phone}`, phone, isDemo: true };
  await kvStore.setItemAsync(DEMO_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export async function getSession(): Promise<AppSession | null> {
  if (isFirebaseConfigured()) {
    // Firebase rehydrates its signed-in user from disk asynchronously —
    // reading getAuth().currentUser immediately after launch can race that
    // and return null even when a session exists. Waiting for the first
    // onAuthStateChanged callback is the documented fix.
    const user = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(getAuth(), (u) => {
        unsubscribe();
        resolve(u);
      });
    });
    if (!user) return null;
    return { userId: user.uid, phone: user.phoneNumber ?? '', isDemo: false };
  }

  const raw = await kvStore.getItemAsync(DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  if (isFirebaseConfigured()) {
    await firebaseSignOut(getAuth());
    return;
  }
  await kvStore.deleteItemAsync(DEMO_SESSION_KEY);
}
