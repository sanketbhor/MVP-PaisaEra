export { getProfile, updateProfile } from './userService';
export { addGoal } from './goalService';
export { loadCreatedGoals, saveCreatedGoals } from './createdGoalsStore';
export { logConsent, revokeConsent, listConsents } from './consentService';
export type { UserProfile, GoalRecord, ConsentRecord, ConsentType } from './types';
