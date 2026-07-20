// Core calculation engine: income, expenses, savings, safe-to-spend,
// affordability, forecast, budget status. Pure functions over EngineInput.
// No strings are composed here beyond a short bill summary label (data, not
// prose) — natural-language phrasing lives entirely in src/explain/.

import type { ConfidenceLevel } from '../theme/tokens';
import { categorizeAll } from './categorization';
import { BUDGET_RULES, CONFIDENCE_RULES } from './rules';
import type {
  AffordabilityResult,
  Bill,
  BudgetStatusResult,
  CategoryBudget,
  CategorySpendShareResult,
  EngineInput,
  ExpensesResult,
  ForecastResult,
  IncomeResult,
  SafeToSpendResult,
  SavingsResult,
  TopMerchantResult,
  TransactionCategory,
} from './types';

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24));
}

function summarizeBills(bills: Bill[]): string {
  const subs = bills.filter((b) => b.category === 'subscription');
  const others = bills.filter((b) => b.category !== 'subscription');
  const items = others.map((b) => b.shortLabel);
  if (subs.length > 0) {
    const insertAt = items.length > 2 ? 2 : items.length;
    items.splice(insertAt, 0, `${subs.length} subs`);
  }
  return items.join(', ');
}

export function computeOverallConfidence(input: EngineInput): ConfidenceLevel {
  if (input.daysTrackedWithApp < CONFIDENCE_RULES.GROWING_BELOW_DAYS) return 'growing';
  if (input.billsAreEstimate || input.daysTrackedWithApp < CONFIDENCE_RULES.BUILDING_BELOW_DAYS) return 'building';
  return 'high';
}

export function computeIncome(input: EngineInput): IncomeResult {
  const creditTransactions = input.transactions.filter((t) => t.type === 'credit');
  const total = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  return {
    total,
    detectedDate: creditTransactions[0]?.date ?? input.today,
    provenance: { transactionIds: creditTransactions.map((t) => t.id) },
  };
}

export function computeExpenses(input: EngineInput): ExpensesResult {
  const billsTotal = input.bills.reduce((sum, b) => sum + b.amount, 0);
  // Subscription-category transactions are excluded here because the matching
  // bill record already counts that charge in billsTotal — this avoids
  // double-counting the same real-world debit twice.
  const variableDebits = categorizeAll(input.transactions).filter(
    (t) => t.type === 'debit' && t.category !== 'Subscription',
  );
  const variableTotal = variableDebits.reduce((sum, t) => sum + t.amount, 0);

  return {
    billsTotal,
    variableTotal,
    total: billsTotal + variableTotal,
    provenance: {
      billIds: input.bills.map((b) => b.id),
      transactionIds: variableDebits.map((t) => t.id),
    },
  };
}

export function computeSavings(input: EngineInput): SavingsResult {
  const primaryGoal = input.goals[0] ?? null;
  const primaryGoalAllocation = primaryGoal?.monthlyContribution ?? 0;
  return {
    primaryGoalAllocation,
    emergencyBuffer: input.emergencyBuffer,
    total: primaryGoalAllocation + input.emergencyBuffer,
    provenance: { goalIds: primaryGoal ? [primaryGoal.id] : [] },
  };
}

export function computeSafeToSpend(input: EngineInput): SafeToSpendResult {
  const income = computeIncome(input);
  const savings = computeSavings(input);
  const billsTotal = input.bills.reduce((sum, b) => sum + b.amount, 0);
  const primaryGoal = input.goals[0] ?? null;

  const remaining = income.total - billsTotal - savings.total;
  const dailyBudget = Math.round(remaining / Math.max(input.daysRemainingInMonth, 1));

  return {
    income: income.total,
    incomeDetectedDate: income.detectedDate,
    billsTotal,
    billsCount: input.bills.length,
    billsSummaryLabel: summarizeBills(input.bills),
    goalAllocation: savings.primaryGoalAllocation,
    goalLabel: primaryGoal ? `${primaryGoal.name} ke liye` : null,
    emergencyBuffer: input.emergencyBuffer,
    remaining,
    daysRemainingInMonth: input.daysRemainingInMonth,
    dailyBudget,
    isEstimate: input.billsAreEstimate,
    confidence: computeOverallConfidence(input),
    provenance: {
      transactionIds: income.provenance.transactionIds,
      billIds: input.bills.map((b) => b.id),
      goalIds: primaryGoal ? [primaryGoal.id] : [],
    },
  };
}

export function computeAffordability(amount: number, input: EngineInput): AffordabilityResult {
  const sts = computeSafeToSpend(input);
  const remainingAfterToday = sts.remaining - amount;
  const daysAfterToday = Math.max(sts.daysRemainingInMonth - 1, 1);

  return {
    requestedAmount: amount,
    canAffordToday: amount <= sts.dailyBudget,
    canAffordThisMonth: amount <= sts.remaining,
    dailyBudgetIfSpentToday: Math.round(remainingAfterToday / daysAfterToday),
    provenance: sts.provenance,
  };
}

export function computeForecast(input: EngineInput): ForecastResult {
  const sts = computeSafeToSpend(input);
  const expenses = computeExpenses(input);
  const today = new Date(input.today);
  const daysElapsedThisMonth = Math.max(today.getDate(), 1);

  const dailyRunRate = expenses.variableTotal / daysElapsedThisMonth;
  const projectedRemainingVariableSpend = Math.round(dailyRunRate * input.daysRemainingInMonth);
  const projectedMonthEndRemaining = sts.remaining - projectedRemainingVariableSpend;

  return {
    dailyRunRate: Math.round(dailyRunRate),
    daysElapsedThisMonth,
    projectedRemainingVariableSpend,
    projectedMonthEndRemaining,
    isProjectedOverspend: projectedMonthEndRemaining < 0,
    provenance: expenses.provenance,
  };
}

export function computeBudgetStatus(budget: CategoryBudget): BudgetStatusResult {
  const pctUsed = budget.budgeted > 0 ? budget.spent / budget.budgeted : 0;
  const remainingAmount = budget.budgeted - budget.spent;
  const pctChangeVsLastMonth =
    budget.previousMonthSpent > 0
      ? Math.round(((budget.spent - budget.previousMonthSpent) / budget.previousMonthSpent) * 100)
      : null;

  const level: BudgetStatusResult['level'] =
    pctUsed > 1 ? 'over' : pctUsed >= BUDGET_RULES.NEAR_LIMIT_THRESHOLD ? 'near' : 'under';

  return {
    budgetId: budget.id,
    pctUsed,
    level,
    remainingAmount,
    pctChangeVsLastMonth,
    provenance: { ruleIds: [`budget-${level}`] },
  };
}

// Which single merchant contributed most to a category's spend this month —
// the basis for "zyadatar Swiggy pe" style detail in chat answers.
export function computeTopMerchantForCategory(
  category: TransactionCategory,
  input: EngineInput,
): TopMerchantResult {
  const matches = categorizeAll(input.transactions).filter(
    (t) => t.type === 'debit' && t.category === category,
  );
  if (matches.length === 0) {
    return { merchant: null, amount: 0, provenance: {} };
  }

  const byMerchant = new Map<string, number>();
  for (const t of matches) {
    byMerchant.set(t.merchant, (byMerchant.get(t.merchant) ?? 0) + t.amount);
  }
  let topMerchant = matches[0].merchant;
  let topAmount = 0;
  for (const [merchant, amount] of byMerchant) {
    if (amount > topAmount) {
      topMerchant = merchant;
      topAmount = amount;
    }
  }

  return {
    merchant: topMerchant,
    amount: topAmount,
    provenance: { transactionIds: matches.filter((t) => t.merchant === topMerchant).map((t) => t.id) },
  };
}

// What share of monthly income a budget category consumes — the basis for
// the Community screen's own-spend-vs-benchmark comparison. Real math off
// this user's own income and spend; the benchmark it's compared against is
// separate, aggregate population data (see mockData's communityBenchmarks),
// never something this function invents.
export function computeCategorySpendPctOfIncome(
  budget: CategoryBudget,
  input: EngineInput,
): CategorySpendShareResult {
  const income = computeIncome(input);
  const pctOfIncome = income.total > 0 ? budget.spent / income.total : 0;
  return {
    budgetId: budget.id,
    pctOfIncome,
    provenance: { transactionIds: income.provenance.transactionIds },
  };
}

export { daysBetween };
