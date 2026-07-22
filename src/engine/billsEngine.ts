// Recurring-bill detection. Finds merchants that charge on a roughly
// monthly cadence at a roughly stable amount — the same real debit
// transactions the categorization engine already sees, reasoned about as a
// pattern over time rather than one-at-a-time. Subscriptions (Bill.category
// === 'subscription') are just bills detected here with a subscription-like
// merchant name — see SubscriptionsScreen, which filters this same list.
import { daysBetween } from './calculations';
import { RECURRING_BILL_RULES } from './rules';
import type { Bill, BillCategory, RawTransaction } from './types';

function normalizeMerchantKey(merchant: string): string {
  return merchant.trim().toLowerCase();
}

function titleCase(merchant: string): string {
  return merchant
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

function classifyBillCategory(merchant: string): BillCategory {
  const m = merchant.toLowerCase();
  if (/netflix|spotify|hotstar|icloud|prime video|prime membership|youtube premium|apple music|disney/.test(m)) {
    return 'subscription';
  }
  if (/jio|airtel|vodafone|\bvi\b|broadband|wifi|mobile recharge|postpaid/.test(m)) return 'telecom';
  if (/electricity|bijli|water bill|water board|gas bill|discom|power bill/.test(m)) return 'utility';
  if (/rent|landlord|housing society|maintenance charge/.test(m)) return 'housing';
  return 'other';
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function detectRecurringBills(allTransactions: RawTransaction[], today: string): Bill[] {
  const byMerchant = new Map<string, RawTransaction[]>();
  for (const tx of allTransactions) {
    if (tx.type !== 'debit') continue;
    const key = normalizeMerchantKey(tx.merchant);
    const list = byMerchant.get(key) ?? [];
    list.push(tx);
    byMerchant.set(key, list);
  }

  const bills: Bill[] = [];
  for (const [key, txs] of byMerchant) {
    if (txs.length < RECURRING_BILL_RULES.MIN_OCCURRENCES) continue;
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));

    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(sorted[i - 1].date, sorted[i].date));
    }
    const medianGap = median(gaps);
    if (medianGap < RECURRING_BILL_RULES.MIN_INTERVAL_DAYS || medianGap > RECURRING_BILL_RULES.MAX_INTERVAL_DAYS) {
      continue;
    }

    const amounts = sorted.map((t) => t.amount);
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const maxDeviation = avgAmount > 0 ? Math.max(...amounts.map((a) => Math.abs(a - avgAmount) / avgAmount)) : 1;
    if (maxDeviation > RECURRING_BILL_RULES.MAX_AMOUNT_VARIANCE) continue;

    const last = sorted[sorted.length - 1];
    const category = classifyBillCategory(last.merchant);
    const name = titleCase(last.merchant);

    bills.push({
      id: `bill-${key.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
      name,
      shortLabel: name.length > 14 ? `${name.slice(0, 13)}…` : name,
      amount: Math.round(last.amount),
      dueDate: addDays(last.date, Math.round(medianGap)),
      category,
      monthsObserved: sorted.length - 1,
      lastRenewedDate: last.date,
      icon: category === 'subscription' ? '🎬' : undefined,
    });
  }

  return bills.filter((b) => daysBetween(b.lastRenewedDate, today) <= RECURRING_BILL_RULES.MAX_INTERVAL_DAYS);
}
