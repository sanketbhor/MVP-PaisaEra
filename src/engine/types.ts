// Type definitions for the deterministic finance engine.
// This file (and everything under src/engine/) must never import from React,
// React Native, or any language/AI layer. It describes data only.

import type { ConfidenceLevel } from '../theme/tokens';

// ── Provenance ──────────────────────────────────────────────────────────
// Every computed result carries one of these, naming the exact input records
// (and, where relevant, the rule) that produced it. This is what the "Why
// this?" panel reads from — never a free-text explanation the engine made up.
export interface Provenance {
  transactionIds?: string[];
  billIds?: string[];
  goalIds?: string[];
  ruleIds?: string[];
}

// ── Inputs ──────────────────────────────────────────────────────────────

export type TransactionCategory =
  | 'Food'
  | 'Fuel'
  | 'Groceries'
  | 'Transfer'
  | 'Shopping'
  | 'Subscription';

export interface RawTransaction {
  id: string;
  merchant: string;
  amount: number;
  date: string; // ISO date
  type: 'debit' | 'credit';
  // Set once the user manually confirms/fixes a category via the recategorize
  // sheet. When present, the categorization engine trusts it over any rule.
  userConfirmedCategory?: TransactionCategory;
}

export interface CategorizedTransaction extends RawTransaction {
  category: TransactionCategory;
  isConfirmed: boolean; // true = high-confidence rule match or user-confirmed; false = low-confidence guess
  matchedRuleId: string | null; // 'user-override' | a rule id from categorization.ts | null (no rule matched)
}

export type BillCategory = 'housing' | 'utility' | 'subscription' | 'telecom' | 'other';

export interface Bill {
  id: string;
  name: string;
  shortLabel: string;
  amount: number;
  dueDate: string; // ISO date — for subscription category, this is the next renewal date
  category: BillCategory;
  monthsObserved: number; // consecutive months this recurring charge has repeated
  lastRenewedDate: string; // ISO date of most recent charge
  icon?: string; // emoji, subscription-category bills only
  cancelUrl?: string; // provider account page — subscription-category bills only
}

export interface Goal {
  id: string;
  emoji: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  deadlineDate: string; // ISO date
}

export interface CategoryBudget {
  id: string;
  category: string;
  emoji: string;
  budgeted: number;
  spent: number;
  previousMonthSpent: number;
}

// The full set of raw inputs the engine operates on. Nothing outside this
// object (and the "today"/flags below) feeds any calculation.
export interface EngineInput {
  today: string; // ISO date, treated as "now"
  transactions: RawTransaction[];
  bills: Bill[]; // includes subscription-category bills — see note in mockData
  goals: Goal[]; // goals[0] is the "primary" goal that reduces daily safe-to-spend
  categoryBudgets: CategoryBudget[];
  emergencyBuffer: number;
  daysRemainingInMonth: number;
  daysTrackedWithApp: number;
  // Total transactions ingested by the AA/SMS pipeline this month — a declared
  // fact from the ingestion layer, distinct from transactions.length (which is
  // just the slice of recent activity this mock/UI holds for display).
  transactionsTrackedCount: number;
  billsAreEstimate: boolean; // fewer than one full billing cycle observed
  cashTrackingEnabled: boolean;
  upiFullyCategorized: boolean;
}

// ── Outputs ─────────────────────────────────────────────────────────────

export interface IncomeResult {
  total: number;
  detectedDate: string; // ISO date of the credited salary transaction
  provenance: Provenance;
}

export interface ExpensesResult {
  billsTotal: number;
  variableTotal: number; // non-bill debit transactions this month
  total: number;
  provenance: Provenance;
}

export interface SavingsResult {
  primaryGoalAllocation: number;
  emergencyBuffer: number;
  total: number;
  provenance: Provenance;
}

export interface SafeToSpendResult {
  income: number;
  incomeDetectedDate: string; // ISO date
  billsTotal: number;
  billsCount: number;
  billsSummaryLabel: string;
  goalAllocation: number;
  goalLabel: string | null;
  emergencyBuffer: number;
  remaining: number;
  daysRemainingInMonth: number;
  dailyBudget: number;
  isEstimate: boolean;
  confidence: ConfidenceLevel;
  provenance: Provenance;
}

export interface AffordabilityResult {
  requestedAmount: number;
  canAffordToday: boolean; // fits within today's safe-to-spend
  canAffordThisMonth: boolean; // fits within what's left of the month
  dailyBudgetIfSpentToday: number; // recomputed daily budget for the rest of the month if this is spent today
  provenance: Provenance;
}

export interface ForecastResult {
  dailyRunRate: number; // average variable (non-bill) spend per day so far this month
  daysElapsedThisMonth: number;
  projectedRemainingVariableSpend: number;
  projectedMonthEndRemaining: number;
  isProjectedOverspend: boolean;
  provenance: Provenance;
}

export type BudgetStatusLevel = 'over' | 'near' | 'under';

export interface BudgetStatusResult {
  budgetId: string;
  pctUsed: number;
  level: BudgetStatusLevel;
  remainingAmount: number; // budgeted - spent (negative when over)
  pctChangeVsLastMonth: number | null;
  provenance: Provenance;
}

export interface GoalStatusResult {
  goalId: string;
  requiredMonthlyPace: number;
  monthsRemaining: number;
  isOnTrack: boolean;
  provenance: Provenance;
}

export interface SubscriptionInsightResult {
  merchants: string[];
  totalAmount: number;
  windowDays: number;
  monthsObserved: number;
  confidence: ConfidenceLevel;
  provenance: Provenance;
}

export interface TopMerchantResult {
  merchant: string | null;
  amount: number;
  provenance: Provenance;
}

export interface GoalProjectionResult {
  goalId: string;
  monthsAtCurrentPace: number; // Infinity if monthlyContribution is 0
  projectedCompletionDate: string | null; // ISO date, or null if never at current pace
  provenance: Provenance;
}

export interface CategorySpendShareResult {
  budgetId: string;
  pctOfIncome: number; // 0..1, category spend ÷ monthly income
  provenance: Provenance;
}

// ── Gamification / progression ─────────────────────────────────────────
// Some fields below (streak, peer percentile, personality labels) are
// declared facts from an upstream analytics/community-aggregation service —
// the same category as billsAreEstimate or transactionsTrackedCount, not
// something derived from nothing here. What IS computed by the engine is
// the savings-rate-vs-baseline ratio and the level it maps to.

export interface MoneyPersonality {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  strength: string;
  weakness: string;
  superpower: string;
}

export interface LevelDefinition {
  id: string;
  emoji: string;
  name: string;
}

export interface GamificationInput {
  // Savings rate (savings ÷ income) from when the user started being tracked.
  baselineSavingsRate: number; // 0..1, declared
  consistentSavingsMonths: number; // declared: consecutive months with positive net savings
  peerSavingsPercentile: number; // 0..1, e.g. 0.85 = "top 15%" — anonymized community aggregate
  personality: MoneyPersonality;
  // False for a brand-new (Day-1) user — gates the whole feature so it never
  // implies a streak/level/personality the app hasn't actually observed.
  hasEnoughHistory: boolean;
}

export interface ProgressionStatus {
  currentLevelIndex: number; // 0-based index into PROGRESSION_LEVELS
  currentSavingsRate: number; // 0..1, real computed (savings ÷ income)
  pctAheadOfBaseline: number; // real computed ratio, can be negative
  pctGapToNextLevel: number | null; // null if already at the top level
  provenance: Provenance;
}
