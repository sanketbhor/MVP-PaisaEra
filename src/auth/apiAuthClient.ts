// Thin HTTP client for the homegrown OTP backend (Backend/app/) — the one
// place a fetch call to that API gets made. Everything else in src/auth
// imports isAuthApiConfigured/postJson from here rather than calling fetch
// directly, mirroring the supabaseClient.ts pattern used elsewhere in this
// module.
const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL ?? '';

// True only when a base URL is configured. When false, authService.ts
// falls back to a clearly-labeled local demo mode — see authService.ts.
export const isAuthApiConfigured = Boolean(AUTH_API_URL);

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export async function postJson<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${AUTH_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T;
  return { status: res.status, data };
}
