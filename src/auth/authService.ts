// Phone/OTP auth. Every function here has a real Supabase code path and a
// demo-mode fallback (see isSupabaseConfigured) — the fallback exists so the
// onboarding flow is fully testable without a live backend, and it
// deliberately mirrors the same shape (cooldowns, rate limits, expiry) a
// real backend enforces, rather than just always succeeding.
import { kvStore } from '../storage/kvStore';
import { supabase, isSupabaseConfigured } from './supabaseClient';
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

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      if (error.status === 429) {
        return { ok: false, error: 'rate_limited', retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
      }
      return { ok: false, error: 'unknown', message: error.message };
    }
    return { ok: true, cooldownSeconds: RESEND_COOLDOWN_SECONDS };
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('expired')) return { ok: false, error: 'expired_code' };
      if (msg.includes('invalid') || msg.includes('token')) return { ok: false, error: 'invalid_code' };
      return { ok: false, error: 'unknown', message: error.message };
    }
    if (!data.session || !data.user) {
      return { ok: false, error: 'unknown', message: 'No session returned' };
    }
    return { ok: true, session: { userId: data.user.id, phone, isDemo: false } };
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
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return { userId: data.session.user.id, phone: data.session.user.phone ?? '', isDemo: false };
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
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  await kvStore.deleteItemAsync(DEMO_SESSION_KEY);
}
