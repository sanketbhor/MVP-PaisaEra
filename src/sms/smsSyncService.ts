// Orchestrates: read the device inbox (last N days) -> parse each message
// -> upload structured results to Backend/app. Raw SMS bodies stay on the
// device; only parsed, structured records are sent over the network.
import { readInboxSince, isSmsReadingSupported } from './smsReader';
import { parseTransactionSms } from './smsParser';
import { uploadTransactions, isTransactionsApiConfigured } from './transactionsApiClient';

export interface SyncResult {
  ok: boolean;
  scanned: number;
  parsed: number;
  uploaded: number;
  error?: string;
}

const SYNC_WINDOW_DAYS = 90;

export async function syncSmsTransactions(accessToken: string): Promise<SyncResult> {
  if (!isSmsReadingSupported()) {
    return { ok: false, scanned: 0, parsed: 0, uploaded: 0, error: 'unsupported_platform' };
  }
  if (!isTransactionsApiConfigured) {
    return { ok: false, scanned: 0, parsed: 0, uploaded: 0, error: 'api_not_configured' };
  }

  try {
    const since = Date.now() - SYNC_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const messages = await readInboxSince(since);
    console.log(`[sms-sync] read ${messages.length} inbox messages since ${new Date(since).toISOString()}`);

    const parsed = messages
      .map((m) => parseTransactionSms(m.address, m.body, m.timestampMs))
      .filter((p): p is NonNullable<typeof p> => p !== null);
    console.log(`[sms-sync] parsed ${parsed.length} of ${messages.length} as transactions`);

    const uploaded = await uploadTransactions(accessToken, parsed);
    console.log(`[sms-sync] uploaded ${uploaded} new transactions`);

    return { ok: true, scanned: messages.length, parsed: parsed.length, uploaded };
  } catch (err) {
    console.error('[sms-sync] failed:', err);
    return {
      ok: false,
      scanned: 0,
      parsed: 0,
      uploaded: 0,
      error: err instanceof Error ? err.message : 'unknown_error',
    };
  }
}
