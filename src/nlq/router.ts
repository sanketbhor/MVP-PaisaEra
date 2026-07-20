// Query router — the ONLY file in the app that bridges free-text user input
// and the finance engine. It classifies intent, calls the appropriate
// engine function(s), and returns a Fact: a plain-data snapshot with
// provenance. It receives EngineInput (which contains transactions) but
// never passes EngineInput onward — everything downstream of this file only
// ever sees a Fact.

import {
  computeBudgetStatus,
  computeGoalProjection,
  computeGoalStatus,
  computeOverallConfidence,
  computeSafeToSpend,
  computeTopMerchantForCategory,
  detectSubscriptionRenewalInsight,
} from '../engine';
import type { EngineInput, TransactionCategory } from '../engine';
import { formatMonthName, formatMonthYear } from '../utils/formatDate';
import { classifyQuery } from './intents';
import type { Fact } from './types';

function mapBudgetCategoryToTransactionCategory(category: string): TransactionCategory | null {
  const map: Record<string, TransactionCategory> = {
    Food: 'Food',
    Transport: 'Fuel',
    Shopping: 'Shopping',
    Groceries: 'Groceries',
  };
  return map[category] ?? null;
}

function projectedCompletionLabel(monthsAtCurrentPace: number, projectedCompletionDate: string): string {
  return monthsAtCurrentPace <= 18
    ? `~${Math.round(monthsAtCurrentPace)} mahine`
    : formatMonthYear(projectedCompletionDate);
}

export function routeQuery(text: string, input: EngineInput): Fact {
  const goalNames = input.goals.map((g) => g.name);
  const categoryNames = input.categoryBudgets.map((b) => b.category);
  const intent = classifyQuery(text, goalNames, categoryNames);
  const overallConfidence = computeOverallConfidence(input);

  const findGoal = (nameGuess: string | undefined) =>
    input.goals.find((g) => g.name.toLowerCase() === (nameGuess ?? '').toLowerCase()) ?? null;

  switch (intent.kind) {
    case 'affordabilityGoal': {
      const goal = findGoal(intent.goalNameGuess);
      if (!goal) {
        return {
          kind: 'unknownGoal',
          askedName: intent.goalNameGuess ?? text,
          confidence: 'growing',
          provenance: {},
          sourceTab: null,
          sourceLabel: '',
        };
      }
      const status = computeGoalStatus(goal, input.today);
      const projection = computeGoalProjection(goal, input.today);
      const hasFinitePace = Number.isFinite(projection.monthsAtCurrentPace);

      return {
        kind: 'affordabilityGoal',
        goalName: goal.name,
        goalEmoji: goal.emoji,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
        remainingAmount: Math.max(goal.targetAmount - goal.savedAmount, 0),
        monthlyContribution: goal.monthlyContribution,
        requiredMonthlyPaceForDeadline: status.requiredMonthlyPace,
        isOnTrackForDeadline: status.isOnTrack,
        deadlineMonthLabel: formatMonthName(goal.deadlineDate),
        monthsAtCurrentPace: hasFinitePace ? projection.monthsAtCurrentPace : null,
        projectedCompletionLabel:
          hasFinitePace && projection.projectedCompletionDate
            ? projectedCompletionLabel(projection.monthsAtCurrentPace, projection.projectedCompletionDate)
            : null,
        confidence: overallConfidence,
        provenance: status.provenance,
        sourceTab: 'goals',
        sourceLabel: `${goal.name} goal ke numbers`,
      };
    }

    case 'categorySpend': {
      const budget = input.categoryBudgets.find(
        (b) => b.category.toLowerCase() === (intent.categoryGuess ?? '').toLowerCase(),
      );
      if (!budget) {
        return { kind: 'unknownQuery', confidence: 'growing', provenance: {}, sourceTab: null, sourceLabel: '' };
      }
      const status = computeBudgetStatus(budget);
      const txCategory = mapBudgetCategoryToTransactionCategory(budget.category);
      const top = txCategory
        ? computeTopMerchantForCategory(txCategory, input)
        : { merchant: null, amount: 0, provenance: {} };

      return {
        kind: 'categorySpend',
        category: budget.category,
        emoji: budget.emoji,
        spent: budget.spent,
        budgeted: budget.budgeted,
        remainingAmount: status.remainingAmount,
        pctChangeVsLastMonth: status.pctChangeVsLastMonth,
        level: status.level,
        topMerchant: top.merchant,
        topMerchantAmount: top.amount,
        confidence: overallConfidence,
        provenance: { ...status.provenance, transactionIds: top.provenance.transactionIds },
        sourceTab: 'budgets',
        sourceLabel: `${input.transactionsTrackedCount} transactions + ${budget.category} budget`,
      };
    }

    case 'safeToSpend': {
      const sts = computeSafeToSpend(input);
      return {
        kind: 'safeToSpend',
        dailyBudget: sts.dailyBudget,
        remaining: sts.remaining,
        daysRemainingInMonth: sts.daysRemainingInMonth,
        isEstimate: sts.isEstimate,
        confidence: sts.confidence,
        provenance: sts.provenance,
        sourceTab: 'home',
        sourceLabel: 'Safe to spend ka hisaab',
      };
    }

    case 'goalStatus': {
      const goal = findGoal(intent.goalNameGuess);
      if (!goal) {
        return {
          kind: 'unknownGoal',
          askedName: intent.goalNameGuess ?? text,
          confidence: 'growing',
          provenance: {},
          sourceTab: null,
          sourceLabel: '',
        };
      }
      const status = computeGoalStatus(goal, input.today);
      return {
        kind: 'goalStatus',
        goalName: goal.name,
        goalEmoji: goal.emoji,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
        monthlyContribution: goal.monthlyContribution,
        requiredMonthlyPace: status.requiredMonthlyPace,
        isOnTrack: status.isOnTrack,
        deadlineMonthLabel: formatMonthName(goal.deadlineDate),
        confidence: overallConfidence,
        provenance: status.provenance,
        sourceTab: 'goals',
        sourceLabel: `${goal.name} goal`,
      };
    }

    case 'subscriptionSpend': {
      const subs = input.bills.filter((b) => b.category === 'subscription');
      const insight = detectSubscriptionRenewalInsight(input);
      return {
        kind: 'subscriptionSpend',
        count: subs.length,
        monthlyTotal: subs.reduce((sum, b) => sum + b.amount, 0),
        recentRenewalCount: insight ? insight.merchants.length : null,
        recentRenewalAmount: insight ? insight.totalAmount : null,
        recentRenewalMerchants: insight ? insight.merchants : [],
        confidence: insight ? insight.confidence : overallConfidence,
        provenance: insight ? insight.provenance : { billIds: subs.map((b) => b.id) },
        sourceTab: 'subscriptions',
        sourceLabel: `${subs.length} subscriptions`,
      };
    }

    default:
      return { kind: 'unknownQuery', confidence: 'growing', provenance: {}, sourceTab: null, sourceLabel: '' };
  }
}
