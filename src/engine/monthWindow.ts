// Calendar-month windowing. EngineInput.transactions is documented (see
// mockData.ts) to hold only the current calendar month's activity — income/
// expense/safe-to-spend calculations sum it directly with no date filtering
// of their own. Real SMS-derived history spans up to 90 days, so callers
// must narrow it to "this month" before handing it to EngineInput —
// otherwise computeIncome would sum three months of salary as one.
import type { RawTransaction } from './types';

function isSameCalendarMonth(dateISO: string, todayISO: string): boolean {
  return dateISO.slice(0, 7) === todayISO.slice(0, 7);
}

export function filterToCurrentMonth(transactions: RawTransaction[], today: string): RawTransaction[] {
  return transactions.filter((t) => isSameCalendarMonth(t.date, today));
}

export function filterToPreviousMonth(transactions: RawTransaction[], today: string): RawTransaction[] {
  const d = new Date(today);
  d.setMonth(d.getMonth() - 1);
  const prevMonthKey = d.toISOString().slice(0, 7);
  return transactions.filter((t) => t.date.slice(0, 7) === prevMonthKey);
}
