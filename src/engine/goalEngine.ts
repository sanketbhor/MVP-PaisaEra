// Goal engine.
// On-track / behind is real math, not a guess: it compares the monthly amount
// a goal actually needs (remaining ÷ months left) against what's actually
// being contributed. Kept as its own file/engine per the architecture split
// from calculations.ts (income/expenses/safe-to-spend) and categorization.ts.

import { GOAL_RULES } from './rules';
import type { Goal, GoalProjectionResult, GoalStatusResult } from './types';
import { addMonthsToDate } from '../utils/formatDate';

function monthsBetween(fromISO: string, toISO: string): number {
  const days = Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24));
  return days / 30;
}

export function computeGoalStatus(goal: Goal, today: string): GoalStatusResult {
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const monthsRemaining = Math.max(monthsBetween(today, goal.deadlineDate), 0.1);
  const requiredMonthlyPace = remaining / monthsRemaining;
  const isOnTrack = goal.monthlyContribution >= requiredMonthlyPace * GOAL_RULES.ON_TRACK_TOLERANCE;

  return {
    goalId: goal.id,
    requiredMonthlyPace,
    monthsRemaining,
    isOnTrack,
    provenance: { goalIds: [goal.id] },
  };
}

export function computeGoalProgressPct(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(1, Math.max(0, goal.savedAmount / goal.targetAmount));
}

// Projects when a goal actually finishes at its CURRENT contribution rate —
// distinct from computeGoalStatus's requiredMonthlyPace, which is the pace
// needed to hit the deadline. This is what lets the AI layer answer "when
// will I actually get there at this rate?" without doing any math itself.
export function computeGoalProjection(goal: Goal, today: string): GoalProjectionResult {
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const monthsAtCurrentPace = goal.monthlyContribution > 0 ? remaining / goal.monthlyContribution : Infinity;

  return {
    goalId: goal.id,
    monthsAtCurrentPace,
    projectedCompletionDate: Number.isFinite(monthsAtCurrentPace)
      ? addMonthsToDate(today, monthsAtCurrentPace)
      : null,
    provenance: { goalIds: [goal.id] },
  };
}
