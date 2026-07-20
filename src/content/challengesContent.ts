// Static challenge/badge catalog — the definitions are content, not
// something derived from a user's finances. Actual join-state lives in
// screen-local React state; progress math is real (see challengesEngine.ts).

export interface Challenge {
  id: string;
  icon: string;
  name: string;
  description: string;
  startDate: string; // ISO — only meaningful once joined
  durationDays: number;
  participantCount: number;
  joinedByDefault: boolean;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'no-spend-weekend',
    icon: '🚫',
    name: 'No-Spend Weekend',
    description: 'Din 1 clear · kal complete hoga.',
    startDate: '2026-07-19',
    durationDays: 2,
    participantCount: 2140,
    joinedByDefault: true,
  },
  {
    id: '30-day-savings',
    icon: '📅',
    name: '30-Day Savings Challenge',
    description: 'Har din thoda bachao · badge on finish',
    startDate: '2026-07-20',
    durationDays: 30,
    participantCount: 5820,
    joinedByDefault: false,
  },
  {
    id: 'upi-detox',
    icon: '📵',
    name: 'UPI Detox Week',
    description: 'Impulse UPI kam karo · 7 din',
    startDate: '2026-07-20',
    durationDays: 7,
    participantCount: 940,
    joinedByDefault: false,
  },
];

export interface Badge {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-save', icon: '🏅', label: '1st save', earned: true },
  { id: 'streak-5mo', icon: '🔥', label: '5-mo streak', earned: true },
  { id: 'no-spend', icon: '🔒', label: 'No-Spend', earned: false },
];
