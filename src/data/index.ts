export { getProfile, updateProfile } from './userService';
export { addGoal, createGoal, listGoals } from './goalService';
export type { FullGoal } from './goalService';
export { loadCreatedGoals, saveCreatedGoals } from './createdGoalsStore';
export { logConsent, revokeConsent, listConsents } from './consentService';
export type { UserProfile, GoalRecord, ConsentRecord, ConsentType } from './types';
