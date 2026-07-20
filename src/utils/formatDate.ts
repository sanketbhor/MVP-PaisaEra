const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatGreetingDate(dateISO: string): string {
  const d = new Date(dateISO);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatMonthName(dateISO: string): string {
  return MONTHS[new Date(dateISO).getMonth()];
}

export function formatFullDate(dateISO: string): string {
  const d = new Date(dateISO);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatShortDate(dateISO: string): string {
  const d = new Date(dateISO);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

function daysBetweenDates(fromISO: string, toISO: string): number {
  return Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24));
}

// Pure date arithmetic (not a financial calculation) — used by the goal engine
// to project a completion date from a months-remaining number it already computed.
export function addMonthsToDate(dateISO: string, months: number): string {
  const d = new Date(dateISO);
  const wholeDays = Math.round(months * 30);
  d.setDate(d.getDate() + wholeDays);
  return d.toISOString().slice(0, 10);
}

export function formatMonthYear(dateISO: string): string {
  const d = new Date(dateISO);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeDayLabel(dateISO: string, todayISO: string): string {
  const diff = daysBetweenDates(dateISO, todayISO);
  if (diff === 0) return 'Aaj';
  if (diff === 1) return 'Kal';
  return formatShortDate(dateISO);
}

export function relativeRenewalLabel(dateISO: string, todayISO: string): string {
  const diff = daysBetweenDates(todayISO, dateISO);
  if (diff === 0) return 'Aaj renew';
  if (diff === 1) return 'Kal renew';
  return `Har mahine · agla ${formatShortDate(dateISO)}`;
}
