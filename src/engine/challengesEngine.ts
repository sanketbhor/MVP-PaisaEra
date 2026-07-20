// Real math for a time-boxed challenge's progress: days elapsed ÷ total
// duration. Which challenges exist and their descriptions are static content
// (src/content/challengesContent.ts) — this file only computes the number.

export interface ChallengeProgress {
  daysElapsed: number;
  pctComplete: number; // 0..1, clamped
  isComplete: boolean;
}

export function computeChallengeProgress(
  startDateISO: string,
  durationDays: number,
  todayISO: string,
): ChallengeProgress {
  const daysElapsedRaw = Math.round(
    (new Date(todayISO).getTime() - new Date(startDateISO).getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysElapsed = Math.max(0, Math.min(daysElapsedRaw, durationDays));
  const pctComplete = durationDays > 0 ? daysElapsed / durationDays : 0;
  return { daysElapsed, pctComplete, isComplete: daysElapsed >= durationDays };
}
