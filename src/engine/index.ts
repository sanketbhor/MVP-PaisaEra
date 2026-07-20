// Public API of the deterministic finance engine.
//
// This is the ONLY module the rest of the app (screens, components) or any
// future AI/language layer should import from src/engine. It performs every
// calculation — income, expenses, savings, safe-to-spend, affordability,
// forecast, categorization, budget status, goal status, subscription
// detection — deterministically, from plain data, with no network calls and
// no LLM involved anywhere in this folder. Every result carries a
// `provenance` field naming the exact transactions/bills/goals/rules that
// produced it, so any UI (e.g. the "Why this?" panel) can show its work.

export * from './types';

export { CATEGORIZATION_RULES, categorizeTransaction, categorizeAll } from './categorization';

export {
  computeOverallConfidence,
  computeIncome,
  computeExpenses,
  computeSavings,
  computeSafeToSpend,
  computeAffordability,
  computeForecast,
  computeBudgetStatus,
  computeTopMerchantForCategory,
  computeCategorySpendPctOfIncome,
} from './calculations';

export { computeGoalStatus, computeGoalProgressPct, computeGoalProjection } from './goalEngine';

export { detectSubscriptionRenewalInsight } from './subscriptionEngine';

export {
  BUDGET_RULES,
  GOAL_RULES,
  CONFIDENCE_RULES,
  SUBSCRIPTION_RULES,
  BILL_ALERT_RULES,
} from './rules';
