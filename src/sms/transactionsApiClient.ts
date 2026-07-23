// Same backend host as apiAuthClient.ts/aiApiClient.ts, kept separate for
// domain organization (see those files for why the URL isn't shared via a
// single generic client).
import type { ParsedSms } from './smsParser';

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL ?? '';
export const isTransactionsApiConfigured = Boolean(AUTH_API_URL);

export interface RemoteTransaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  occurredAt: string;
  source: string;
  userCategory: string | null;
}

export async function uploadTransactions(accessToken: string, items: ParsedSms[]): Promise<number> {
  if (items.length === 0) return 0;
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const res = await fetch(`${AUTH_API_URL}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ transactions: chunk }),
    });
    if (!res.ok) throw new Error(`upload failed: ${res.status}`);
    const data = (await res.json()) as { inserted: number };
    inserted += data.inserted;
  }
  return inserted;
}

export async function fetchTransactions(accessToken: string, days = 90): Promise<RemoteTransaction[]> {
  const res = await fetch(`${AUTH_API_URL}/transactions?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const data = (await res.json()) as { transactions: RemoteTransaction[] };
  return data.transactions;
}

// Persists a manual category correction so it survives a reinstall/resync
// instead of only living in this screen's local state.
export async function updateTransactionCategory(
  accessToken: string,
  transactionId: string,
  category: string,
): Promise<void> {
  const res = await fetch(`${AUTH_API_URL}/transactions/${transactionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw new Error(`update failed: ${res.status}`);
}

// Soft-deletes a transaction the parser mistakenly created from a
// non-transaction SMS (e.g. a bill-due reminder) — kept server-side so a
// later resync of the same SMS doesn't recreate it.
export async function deleteTransaction(accessToken: string, transactionId: string): Promise<void> {
  const res = await fetch(`${AUTH_API_URL}/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`delete failed: ${res.status}`);
}
