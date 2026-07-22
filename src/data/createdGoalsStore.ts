// The goals table (and its demo-store stand-in) only records goal_type +
// target_amount, but the engine needs the full Goal shape (emoji, deadline,
// monthly contribution) to render and reason about a user-created goal after
// an app restart. This keeps the complete shape locally, per user.
import { kvStore } from '../storage/kvStore';
import type { Goal } from '../engine';

function storageKey(userId: string): string {
  return `paisaera-created-goals-${userId.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

export async function loadCreatedGoals(userId: string): Promise<Goal[]> {
  const raw = await kvStore.getItemAsync(storageKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Goal[];
  } catch {
    return [];
  }
}

export async function saveCreatedGoals(userId: string, goals: Goal[]): Promise<void> {
  await kvStore.setItemAsync(storageKey(userId), JSON.stringify(goals));
}
