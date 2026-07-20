import type { Goal, GoalStatusResult } from '../engine';
import { formatINR } from '../utils/format';

export function buildGoalStatusText(goal: Goal, status: GoalStatusResult): string {
  return status.isOnTrack
    ? `${formatINR(goal.monthlyContribution)}/mo pe — deadline se pehle pahunch jayega.`
    : `Deadline ke liye ${formatINR(status.requiredMonthlyPace)}/mo chahiye — abhi ${formatINR(goal.monthlyContribution)}/mo pe.`;
}
