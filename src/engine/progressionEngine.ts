// Progression engine — the real math behind the Money Personality card and
// the Level screen. "68% ahead of your own baseline" is a genuine ratio
// computed from this month's savings rate vs a declared starting baseline,
// not a number a persona invented. Level thresholds are named business
// rules (see LEVEL_THRESHOLDS), same philosophy as rules.ts.

import { computeIncome, computeSavings } from './calculations';
import type { EngineInput, GamificationInput, LevelDefinition, ProgressionStatus } from './types';

export const PROGRESSION_LEVELS: LevelDefinition[] = [
  { id: 'pocket-saver', emoji: '🐣', name: 'Pocket Saver' },
  { id: 'budget-explorer', emoji: '🧭', name: 'Budget Explorer' },
  { id: 'money-ninja', emoji: '🥷', name: 'Money Ninja' },
  { id: 'financial-freedom', emoji: '🕊', name: 'Financial Freedom' },
];

// pctAheadOfBaseline thresholds a user must clear to sit at each level.
// Level 0 (Pocket Saver) has no floor — everyone starts there.
const LEVEL_THRESHOLDS = [0, 0.2, 0.5, 0.9] as const;

export function computeProgressionStatus(
  gamification: GamificationInput,
  input: EngineInput,
): ProgressionStatus {
  const income = computeIncome(input);
  const savings = computeSavings(input);
  const currentSavingsRate = income.total > 0 ? savings.total / income.total : 0;

  const pctAheadOfBaseline =
    gamification.baselineSavingsRate > 0
      ? (currentSavingsRate - gamification.baselineSavingsRate) / gamification.baselineSavingsRate
      : 0;

  let currentLevelIndex = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pctAheadOfBaseline >= LEVEL_THRESHOLDS[i]) {
      currentLevelIndex = i;
      break;
    }
  }

  const nextThreshold = LEVEL_THRESHOLDS[currentLevelIndex + 1];
  const pctGapToNextLevel = nextThreshold !== undefined ? Math.max(nextThreshold - pctAheadOfBaseline, 0) : null;

  return {
    currentLevelIndex,
    currentSavingsRate,
    pctAheadOfBaseline,
    pctGapToNextLevel,
    provenance: {
      transactionIds: income.provenance.transactionIds,
      goalIds: savings.provenance.goalIds,
    },
  };
}
