import { BUDGET_RULES } from '../engine';
import type { BudgetStatusResult } from '../engine';
import { formatINR } from '../utils/format';

export function buildBudgetInsightText(status: BudgetStatusResult): string {
  if (status.level === 'over') {
    return status.pctChangeVsLastMonth !== null && status.pctChangeVsLastMonth > 0
      ? `Pichle mahine se ${status.pctChangeVsLastMonth}% zyada — abhi ${formatINR(Math.abs(status.remainingAmount))} over.`
      : `${formatINR(Math.abs(status.remainingAmount))} zyada kharch ho gaya budget se.`;
  }
  if (status.level === 'near') {
    return `Bas ${formatINR(status.remainingAmount)} bacha — limit ke kaafi paas.`;
  }
  if (status.pctUsed <= BUDGET_RULES.COMFORTABLY_UNDER_THRESHOLD) {
    return `${formatINR(status.remainingAmount)} bacha hua — bilkul chill.`;
  }
  return `${formatINR(status.remainingAmount)} bacha hua — mahina khatam hone tak theek.`;
}
