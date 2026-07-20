// Subscription engine.
// Detects clusters of subscription-category bills that renewed within a
// short window of each other — the basis for the "N subscriptions renewed"
// insight. Kept separate from calculations.ts since it reasons about bills
// as a pattern-detection problem, not a single-number calculation.

import { daysBetween } from './calculations';
import { CONFIDENCE_RULES, SUBSCRIPTION_RULES } from './rules';
import type { Bill, EngineInput, SubscriptionInsightResult } from './types';
import type { ConfidenceLevel } from '../theme/tokens';

export function detectSubscriptionRenewalInsight(
  input: EngineInput,
  windowDays: number = SUBSCRIPTION_RULES.RENEWAL_WINDOW_DAYS,
): SubscriptionInsightResult | null {
  const recentSubs: Bill[] = input.bills.filter((b) => {
    if (b.category !== 'subscription') return false;
    const gap = daysBetween(b.lastRenewedDate, input.today);
    return gap >= 0 && gap <= windowDays;
  });
  if (recentSubs.length < SUBSCRIPTION_RULES.MIN_RENEWALS_FOR_INSIGHT) return null;

  const monthsObserved = Math.min(...recentSubs.map((b) => b.monthsObserved));
  const confidence: ConfidenceLevel =
    monthsObserved >= CONFIDENCE_RULES.SUBSCRIPTION_HIGH_CONFIDENCE_MONTHS
      ? 'high'
      : monthsObserved >= 1
        ? 'building'
        : 'growing';

  return {
    merchants: recentSubs.map((b) => b.shortLabel),
    totalAmount: recentSubs.reduce((sum, b) => sum + b.amount, 0),
    windowDays,
    monthsObserved,
    confidence,
    provenance: { billIds: recentSubs.map((b) => b.id) },
  };
}
