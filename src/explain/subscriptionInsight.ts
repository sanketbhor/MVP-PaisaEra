import { computeIncome } from '../engine';
import type { EngineInput, SubscriptionInsightResult } from '../engine';
import { formatINR } from '../utils/format';
import { resolveSourceRecords } from './resolveProvenance';
import type { WhyThisData } from './types';

export function buildSubscriptionInsightText(insight: SubscriptionInsightResult): string {
  return `Bhai, ${insight.windowDays} din mein ${insight.merchants.length} subscriptions renew ho gaye — ${insight.merchants.join(', ')}. ${formatINR(insight.totalAmount)} nikal gaye. Inpe nazar rakhun?`;
}

const CONFIDENCE_NOTES: Record<SubscriptionInsightResult['confidence'], string> = {
  high: 'Jitna zyada data, utna sahi. Yeh wala kaafi solid hai — teen mahine ka pattern hai.',
  building: 'Pattern ban raha hai — ek-do mahine aur dekhne ke baad aur pakka bata paunga.',
  growing: 'Abhi bahut kam data hai — is pattern ko main abhi seekh raha hoon.',
};

export function buildSubscriptionWhyThis(
  input: EngineInput,
  insight: SubscriptionInsightResult,
): WhyThisData {
  const income = computeIncome(input);

  const dataPointsUsed: string[] = [
    `Is mahine ${input.transactionsTrackedCount} transactions track hue`,
    `Salary detect hui — ${formatINR(income.total)}`,
    `${insight.merchants.join(', ')} — same amount, ${insight.monthsObserved} mahine se repeat`,
  ];

  const missingData: string[] = [];
  if (!input.cashTrackingEnabled) missingData.push('Cash kharcha abhi track nahi hua');
  if (!input.upiFullyCategorized) missingData.push('Kuch UPI transfers categorize nahi hue');

  return {
    headline: `"${insight.windowDays} din mein ${insight.merchants.length} subscriptions renew ho gaye — ${formatINR(insight.totalAmount)} nikle."`,
    dataPointsUsed,
    missingData,
    confidence: insight.confidence,
    confidenceNote: CONFIDENCE_NOTES[insight.confidence],
    sourceRecords: resolveSourceRecords(insight.provenance, input),
  };
}
