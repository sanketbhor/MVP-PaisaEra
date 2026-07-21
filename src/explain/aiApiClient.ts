// Thin HTTP client for the homegrown backend's chat-phrasing route
// (Backend/app/ai.py) — same running server as src/auth/apiAuthClient.ts
// (EXPO_PUBLIC_AUTH_API_URL), just a different route group. Kept as its
// own file rather than importing apiAuthClient directly so this module
// stays about phrasing, not auth, even though they share a host today.
const API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL ?? '';

export const isAiApiConfigured = Boolean(API_URL);

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export async function postJson<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T;
  return { status: res.status, data };
}
