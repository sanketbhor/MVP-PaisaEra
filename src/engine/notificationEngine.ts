// Adaptive notification cadence. Real logic, not a hardcoded schedule:
// new users start at ~2/day; once past the new-user window, cadence adjusts
// from observed engagement (app opens/week). A manual user preference
// (Kam/Auto/Zyada in Settings) always wins when set to something other than
// "auto."

export type CadencePreference = 'low' | 'auto' | 'high';

export interface EngagementInput {
  daysSinceInstall: number;
  appOpensLast7Days: number; // declared/observed engagement metric
  preference: CadencePreference;
}

export interface NotificationCadence {
  notificationsPerDay: number;
  basis: string; // short trace of which rule produced this number
}

const NEW_USER_WINDOW_DAYS = 14;
const NEW_USER_CADENCE = 2;
const HIGH_ENGAGEMENT_OPENS_THRESHOLD = 10; // opens/week
const LOW_ENGAGEMENT_OPENS_THRESHOLD = 3;

export function computeNotificationCadence(engagement: EngagementInput): NotificationCadence {
  if (engagement.preference === 'low') {
    return { notificationsPerDay: 1, basis: 'manual override: Kam' };
  }
  if (engagement.preference === 'high') {
    return { notificationsPerDay: 4, basis: 'manual override: Zyada' };
  }

  if (engagement.daysSinceInstall <= NEW_USER_WINDOW_DAYS) {
    return { notificationsPerDay: NEW_USER_CADENCE, basis: 'naya user — default cadence' };
  }
  if (engagement.appOpensLast7Days >= HIGH_ENGAGEMENT_OPENS_THRESHOLD) {
    return { notificationsPerDay: 3, basis: 'engagement-adjusted — active usage' };
  }
  if (engagement.appOpensLast7Days <= LOW_ENGAGEMENT_OPENS_THRESHOLD) {
    return { notificationsPerDay: 1, basis: 'engagement-adjusted — low usage' };
  }
  return { notificationsPerDay: 2, basis: 'engagement-adjusted — steady usage' };
}
