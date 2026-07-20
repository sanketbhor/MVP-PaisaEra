import { PROGRESSION_LEVELS } from '../engine';
import type { ProgressionStatus } from '../engine';

export function buildLevelStatusText(status: ProgressionStatus): string {
  const pct = Math.round(status.pctAheadOfBaseline * 100);
  const base = `Tere apne baseline se ${pct}% aage`;

  if (status.pctGapToNextLevel === null) {
    return `${base} — tu already Financial Freedom pe hai.`;
  }
  const nextLevel = PROGRESSION_LEVELS[status.currentLevelIndex + 1];
  const gapPct = Math.round(status.pctGapToNextLevel * 100);
  return `${base} — ${nextLevel.name} ke liye ${gapPct}% aur chahiye.`;
}
