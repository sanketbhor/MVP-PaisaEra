// Types for the natural-language query layer.
//
// IMPORTANT invariant: every Fact below is built entirely from scalars
// (numbers/strings/booleans) and a Provenance (id references only). None of
// them can hold a RawTransaction, CategorizedTransaction, or Bill/Goal
// record. This is what makes it structurally impossible for the phrasing
// layer downstream (src/explain/chatResponse.ts) to "calculate" — it
// physically cannot receive the data it would need to.

import type { ConfidenceLevel } from '../theme/tokens';
import type { Provenance } from '../engine';

export type NavigableTab = 'home' | 'transactions' | 'budgets' | 'goals' | 'subscriptions';

interface FactBase {
  confidence: ConfidenceLevel;
  provenance: Provenance;
  sourceTab: NavigableTab | null;
  sourceLabel: string; // short "based on X" description for the chat UI link
}

export interface AffordabilityGoalFact extends FactBase {
  kind: 'affordabilityGoal';
  goalName: string;
  goalEmoji: string;
  savedAmount: number;
  targetAmount: number;
  remainingAmount: number;
  monthlyContribution: number;
  requiredMonthlyPaceForDeadline: number;
  isOnTrackForDeadline: boolean;
  deadlineMonthLabel: string;
  monthsAtCurrentPace: number | null;
  projectedCompletionLabel: string | null;
}

export interface CategorySpendFact extends FactBase {
  kind: 'categorySpend';
  category: string;
  emoji: string;
  spent: number;
  budgeted: number;
  remainingAmount: number;
  pctChangeVsLastMonth: number | null;
  level: 'over' | 'near' | 'under';
  topMerchant: string | null;
  topMerchantAmount: number;
}

export interface SafeToSpendFact extends FactBase {
  kind: 'safeToSpend';
  dailyBudget: number;
  remaining: number;
  daysRemainingInMonth: number;
  isEstimate: boolean;
}

export interface GoalStatusFact extends FactBase {
  kind: 'goalStatus';
  goalName: string;
  goalEmoji: string;
  savedAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  requiredMonthlyPace: number;
  isOnTrack: boolean;
  deadlineMonthLabel: string;
}

export interface SubscriptionSpendFact extends FactBase {
  kind: 'subscriptionSpend';
  count: number;
  monthlyTotal: number;
  recentRenewalCount: number | null;
  recentRenewalAmount: number | null;
  recentRenewalMerchants: string[];
}

export interface UnknownGoalFact extends FactBase {
  kind: 'unknownGoal';
  askedName: string;
}

export interface UnknownQueryFact extends FactBase {
  kind: 'unknownQuery';
}

export type Fact =
  | AffordabilityGoalFact
  | CategorySpendFact
  | SafeToSpendFact
  | GoalStatusFact
  | SubscriptionSpendFact
  | UnknownGoalFact
  | UnknownQueryFact;
