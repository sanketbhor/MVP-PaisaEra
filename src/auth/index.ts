export { isSupabaseConfigured, supabase } from './supabaseClient';
export { isAuthApiConfigured } from './apiAuthClient';
export {
  sendOtp,
  verifyOtp,
  getSession,
  signOut,
  isValidIndianMobile,
  RESEND_COOLDOWN_SECONDS,
  DEMO_OTP_CODE,
} from './authService';
export type { AppSession, OtpSendResult, OtpVerifyResult } from './types';
