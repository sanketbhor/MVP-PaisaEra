// Turns "onboarding just finished" into the engine's honest starting point.
// This is deliberately NOT a rich demo dataset — a real user who just
// signed up has zero observed history, full stop (Principle 2). The two
// paths differ only in what's genuinely knowable on day zero:
//   - link:   Setu's (mocked, sandbox) statement pull can genuinely surface
//             a recent salary credit immediately — that's a real advantage
//             of linking a bank, not a fabricated one.
//   - manual: nothing has been entered yet, so nothing is shown as known.
//             HomeScreen is expected to render an honest "not enough data"
//             state when income comes back as zero, rather than inventing
//             a plausible-looking number.
import type { ConnectPath } from './types';
import type { EngineInput, RawTransaction } from '../engine';

function daysRemainingInMonth(todayISO: string): number {
  const d = new Date(todayISO);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return lastDay - d.getDate() + 1;
}

function isoDaysAgo(todayISO: string, days: number): string {
  const d = new Date(todayISO);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function buildFreshEngineInput(path: ConnectPath, today: string = new Date().toISOString().slice(0, 10)): EngineInput {
  const transactions: RawTransaction[] = [];

  if (path === 'link') {
    transactions.push({
      id: 'onboarding-salary-pull',
      merchant: 'Salary credit (bank statement pull)',
      amount: 45000,
      date: isoDaysAgo(today, 28),
      type: 'credit',
    });
  }

  return {
    today,
    transactions,
    bills: [],
    goals: [], // an onboarding-collected goal *type* has no amount yet — see NoGoalCard, which correctly prompts for one rather than showing an invented progress bar
    categoryBudgets: [],
    emergencyBuffer: path === 'link' ? 6000 : 0, // a link gives the engine enough signal to reserve a cautious buffer; manual has nothing to base one on yet
    daysRemainingInMonth: daysRemainingInMonth(today),
    daysTrackedWithApp: 0,
    transactionsTrackedCount: transactions.length,
    billsAreEstimate: true,
    cashTrackingEnabled: false,
    upiFullyCategorized: false,
  };
}
