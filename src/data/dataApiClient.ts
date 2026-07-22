// Same backend host as apiAuthClient.ts/aiApiClient.ts/transactionsApiClient.ts,
// kept separate for domain organization — see those files for why the URL
// isn't shared via one generic client. Used by goalService.ts/consentService.ts
// once a real access token is available; goalService/consentService still
// fall back to the local demo store when it isn't (see each file).
const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL ?? '';
export const isDataApiConfigured = Boolean(AUTH_API_URL);

async function request<T>(method: 'GET' | 'POST', path: string, accessToken: string, body?: unknown): Promise<T> {
  const res = await fetch(`${AUTH_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getJson<T>(path: string, accessToken: string): Promise<T> {
  return request<T>('GET', path, accessToken);
}

export function postJsonAuthed<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, accessToken, body);
}
