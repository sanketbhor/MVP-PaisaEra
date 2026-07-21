// Phone/OTP auth. Every function here has a real backend code path (the
// homegrown OTP service in Backend/app/, called via apiAuthClient.ts) and a
// demo-mode fallback (see isAuthApiConfigured) — the fallback exists so the
// onboarding flow is fully testable without that backend running, and it
// deliberately mirrors the same shape (cooldowns, rate limits, expiry) the
// real backend enforces, rather than just always succeeding.
//
// Previously Supabase Auth, then Firebase Auth — both real integrations
// that worked, but this backend is a homegrown OTP service instead: 6-digit
// codes generated with `secrets.choice`, hashed with argon2, JWT access +
// refresh tokens on verify. See Backend/README.md for why.
import { kvStore } from '../storage/kvStore';
import { isAuthApiConfigured, postJson } from './apiAuthClient';
import type { AppSession, OtpSendResult, OtpVerifyResult } from './types';

export const RESEND_COOLDOWN_SECONDS = 30;
export const DEMO_OTP_CODE = '123456';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SENDS = 5;
const DEMO_SESSION_KEY = 'paisaera-demo-session';
const API_SESSION_KEY = 'paisaera-api-session';

interface DemoOtpRecord {
  sentAt: number;
  sendCount: number;
  windowStart: number;
}

// In-memory only — a demo run doesn't need this to survive a reload, and
// there's no backend in demo mode to persist it in anyway.
const demoOtpByPhone = new Map<string, DemoOtpRecord>();

// What actually gets persisted for a real session — a superset of the
// public AppSession, since the refresh token isn't something callers
// outside this file should be passing around.
interface StoredApiSession extends AppSession {
  refreshToken: string;
}

function normalizePhone(localNumber: string): string {
  return `+91${localNumber.replace(/\D/g, '')}`;
}

export function isValidIndianMobile(localNumber: string): boolean {
  return /^[6-9]\d{9}$/.test(localNumber.replace(/\D/g, ''));
}

interface OtpRequestResponse {
  ok: boolean;
  cooldown_seconds?: number;
  error?: string;
  retry_after_seconds?: number;
  message?: string;
}

interface OtpVerifyResponse {
  ok: boolean;
  user_id?: string;
  access_token?: string;
  refresh_token?: string;
  error?: string;
  message?: string;
}

export async function sendOtp(localNumber: string): Promise<OtpSendResult> {
  if (!isValidIndianMobile(localNumber)) {
    return { ok: false, error: 'invalid_phone' };
  }
  const phone = normalizePhone(localNumber);

  if (isAuthApiConfigured) {
    try {
      const { status, data } = await postJson<OtpRequestResponse>('/auth/otp/request', { phone: localNumber });
      if (status === 200 && data.ok) {
        return { ok: true, cooldownSeconds: data.cooldown_seconds ?? RESEND_COOLDOWN_SECONDS };
      }
      if (data.error === 'rate_limited') {
        return { ok: false, error: 'rate_limited', retryAfterSeconds: data.retry_after_seconds ?? RESEND_COOLDOWN_SECONDS };
      }
      if (data.error === 'invalid_phone') {
        return { ok: false, error: 'invalid_phone' };
      }
      return { ok: false, error: 'unknown', message: data.message ?? 'Unknown error' };
    } catch {
      return { ok: false, error: 'unknown', message: 'Backend se connect nahi ho paaya.' };
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

  if (isAuthApiConfigured) {
    try {
      const { data } = await postJson<OtpVerifyResponse>('/auth/otp/verify', { phone: localNumber, code });
      if (data.ok && data.user_id && data.access_token && data.refresh_token) {
        const session: StoredApiSession = {
          userId: data.user_id,
          phone,
          isDemo: false,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        };
        await kvStore.setItemAsync(API_SESSION_KEY, JSON.stringify(session));
        return { ok: true, session };
      }
      if (data.error === 'invalid_code' || data.error === 'expired_code') {
        return { ok: false, error: data.error };
      }
      return { ok: false, error: 'unknown', message: data.message ?? 'Unknown error' };
    } catch {
      return { ok: false, error: 'unknown', message: 'Backend se connect nahi ho paaya.' };
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
  if (isAuthApiConfigured) {
    const raw = await kvStore.getItemAsync(API_SESSION_KEY);
    if (!raw) return null;
    try {
      const stored = JSON.parse(raw) as StoredApiSession;
      return { userId: stored.userId, phone: stored.phone, isDemo: false, accessToken: stored.accessToken };
    } catch {
      return null;
    }
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
  if (isAuthApiConfigured) {
    await kvStore.deleteItemAsync(API_SESSION_KEY);
    return;
  }
  await kvStore.deleteItemAsync(DEMO_SESSION_KEY);
}
