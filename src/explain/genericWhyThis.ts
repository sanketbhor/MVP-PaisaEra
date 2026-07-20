// Used when there isn't yet a confident, specific insight to explain (e.g.
// Day-1). Reflects exactly what the engine has observed so far — no invented
// patterns.

import { computeIncome, computeOverallConfidence } from '../engine';
import type { EngineInput } from '../engine';
import { formatINR } from '../utils/format';
import type { WhyThisData } from './types';

export function buildGenericWhyThis(input: EngineInput): WhyThisData {
  const confidence = computeOverallConfidence(input);
  const income = computeIncome(input);

  const dataPointsUsed: string[] = [
    `Ab tak ${input.transactionsTrackedCount} transactions track hue`,
    `Salary detect hui — ${formatINR(income.total)}`,
  ];

  const missingData: string[] = [];
  if (!input.cashTrackingEnabled) missingData.push('Cash kharcha abhi track nahi hua');
  missingData.push('Spending patterns — abhi kaafi data nahi');
  if (input.billsAreEstimate) missingData.push('Bills ka full cycle abhi dekha nahi');

  return {
    headline: `"Abhi sirf ${input.daysTrackedWithApp} din ka data hai — isliye number estimate hai, pakka nahi."`,
    dataPointsUsed,
    missingData,
    confidence,
    confidenceNote: `Sirf ${input.daysTrackedWithApp} din ka data — isliye abhi 'growing'. Jaise-jaise transactions aayenge, main zyada pakka bataunga.`,
    sourceRecords: [],
  };
}
