// Pure parsing of Indian bank/UPI transaction SMS into structured records.
// No React Native imports — testable anywhere. Raw SMS bodies never leave
// the device; only the structured output of this parser gets uploaded.

export interface ParsedSms {
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  occurredAt: string; // ISO datetime from the SMS timestamp
  smsHash: string;
}

const DEBIT_WORDS = /\b(debited|spent|paid|sent|withdrawn|purchase(?:d)?|deducted|txn of)\b/i;
const CREDIT_WORDS = /\b(credited|received|deposited|refund(?:ed)?)\b/i;

// Never transaction notifications — skip before any amount matching.
const SKIP_PATTERNS = [
  /\botp\b/i,
  /one[- ]time password/i,
  /\bverification code\b/i,
  /\brequested money\b/i, // UPI collect requests — nothing moved yet
  /\bwill be (?:debited|deducted)\b/i, // upcoming/autopay notices
  /\boffer\b/i,
  /\bdiscount\b/i,
  /\bcashback of up ?to\b/i,
  /\bapply now\b/i,
  /\bloan\b/i,
  /\bwin\b/i,
];

const AMOUNT_RE = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

// Trailing punctuation only ends a merchant name at a real boundary — a
// bare `\s*[.,;]` would stop at the "." inside "NETFLIX.COM" too.
const END = '(?=\\s+on\\b|\\s+via\\b|\\s+ref\\b|\\s+avl\\b|\\s*[.,;](?:\\s|$)|$)';

// Ordered: most specific first. Each must capture the merchant-ish text.
const MERCHANT_PATTERNS: RegExp[] = [
  /(?:to|at)\s+vpa\s+([a-z0-9.\-_]+)@/i,
  new RegExp(`\\bat\\s+([A-Za-z0-9][A-Za-z0-9 &.'*_-]{1,39}?)${END}`, 'i'),
  new RegExp(`\\b(?:to|towards)\\s+([A-Za-z0-9][A-Za-z0-9 &.'*_-]{1,39}?)${END}`, 'i'),
  // Bank transfer mode (NEFT/IMPS/RTGS/UPI) followed by "from X" — checked
  // before the generic from|by pattern so "by NEFT from TCS LTD" yields
  // "TCS LTD", not "NEFT from TCS LTD".
  new RegExp(`\\b(?:neft|imps|rtgs|upi)\\s+from\\s+([A-Za-z0-9][A-Za-z0-9 &.'*_-]{1,39}?)${END}`, 'i'),
  new RegExp(`\\b(?:from|by)\\s+([A-Za-z0-9][A-Za-z0-9 &.'*_-]{1,39}?)${END}`, 'i'),
];

// Words a merchant capture can accidentally grab from bank boilerplate.
const MERCHANT_REJECTS = /^(?:a\/c|ac|account|your|info|upi|neft|imps|bank)$/i;

// FNV-1a — tiny, stable, dependency-free. Collision odds are irrelevant at
// per-user inbox scale, and the backend dedupes per (user, hash) anyway.
export function hashSms(address: string, timestampMs: number, body: string): string {
  const input = `${address}|${timestampMs}|${body}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0') + input.length.toString(16);
}

export function parseTransactionSms(
  address: string,
  body: string,
  timestampMs: number,
): ParsedSms | null {
  for (const skip of SKIP_PATTERNS) {
    if (skip.test(body)) return null;
  }

  const amountMatch = body.match(AMOUNT_RE);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const debitIdx = body.search(DEBIT_WORDS);
  const creditIdx = body.search(CREDIT_WORDS);
  let type: 'debit' | 'credit';
  if (debitIdx === -1 && creditIdx === -1) return null;
  if (debitIdx === -1) type = 'credit';
  else if (creditIdx === -1) type = 'debit';
  else type = debitIdx < creditIdx ? 'debit' : 'credit';

  let merchant = 'Unknown';
  for (const pattern of MERCHANT_PATTERNS) {
    const m = body.match(pattern);
    if (m) {
      const candidate = m[1].trim().replace(/\s{2,}/g, ' ');
      if (candidate.length >= 2 && !MERCHANT_REJECTS.test(candidate)) {
        merchant = candidate;
        break;
      }
    }
  }

  return {
    amount,
    type,
    merchant,
    occurredAt: new Date(timestampMs).toISOString(),
    smsHash: hashSms(address, timestampMs, body),
  };
}
