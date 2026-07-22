// Category-budget derivation. A "budget" here is never a number the user
// set — it's last month's actual spend in that category, used as the
// comparison ceiling for this month (a standard "your own history is your
// budget" approach). Stays empty until a full previous calendar month of
// real spend exists, matching BudgetsScreen's honest "abhi ban rahe hain"
// empty state — no budget is shown until there's a real one to show.
import { categorizeAll } from './categorization';
import { filterToCurrentMonth, filterToPreviousMonth } from './monthWindow';
import { BUDGET_DERIVATION_RULES } from './rules';
import type { CategoryBudget, RawTransaction, TransactionCategory } from './types';

const CATEGORY_EMOJI: Record<TransactionCategory, string> = {
  Food: '🍔',
  Fuel: '⛽',
  Groceries: '🛒',
  Transfer: '↔',
  Shopping: '🛍',
  Subscription: '🎬',
};

function sumByCategory(transactions: RawTransaction[]): Map<TransactionCategory, number> {
  const totals = new Map<TransactionCategory, number>();
  for (const tx of categorizeAll(transactions)) {
    if (tx.type !== 'debit') continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
  }
  return totals;
}

export function deriveCategoryBudgets(allTransactions: RawTransaction[], today: string): CategoryBudget[] {
  const previousMonthTx = filterToPreviousMonth(allTransactions, today);
  if (previousMonthTx.length === 0 && BUDGET_DERIVATION_RULES.MIN_PREVIOUS_MONTHS_OBSERVED > 0) return [];

  const currentMonthTx = filterToCurrentMonth(allTransactions, today);
  const currentTotals = sumByCategory(currentMonthTx);
  const previousTotals = sumByCategory(previousMonthTx);

  // Transfer isn't a spend category worth budgeting against — it's P2P
  // money movement, not a purchase.
  const categories = new Set<TransactionCategory>([...currentTotals.keys(), ...previousTotals.keys()]);
  categories.delete('Transfer');

  const budgets: CategoryBudget[] = [];
  for (const category of categories) {
    const previousMonthSpent = previousTotals.get(category) ?? 0;
    if (previousMonthSpent <= 0) continue; // no real prior-month signal for this category yet
    budgets.push({
      id: `budget-${category.toLowerCase()}`,
      category,
      emoji: CATEGORY_EMOJI[category],
      budgeted: Math.round(previousMonthSpent),
      spent: Math.round(currentTotals.get(category) ?? 0),
      previousMonthSpent: Math.round(previousMonthSpent),
    });
  }

  return budgets.sort((a, b) => b.spent - a.spent);
}
