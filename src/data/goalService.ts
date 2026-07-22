import { supabase, isSupabaseConfigured, getSession } from '../auth';
import { getJson, postJsonAuthed, isDataApiConfigured } from './dataApiClient';
import { addDemoGoal } from './demoStore';
import type { GoalRecord } from './types';

function mapRow(row: {
  id: string;
  user_id: string;
  goal_type: string;
  target_amount: number | null;
  created_at: string;
}): GoalRecord {
  return { id: row.id, userId: row.user_id, goalType: row.goal_type, targetAmount: row.target_amount, createdAt: row.created_at };
}

// Records the onboarding goal-type selection (e.g. "trip", "emergency") —
// a lightweight signal distinct from a full user-created Goal card (see
// createGoal/listGoals below, the fix for that case). Left on the old
// Supabase-with-demo-fallback path since it isn't the RLS gap users
// actually notice (a missing type-selection row has no visible symptom);
// createGoal is the one that silently failed to persist and is now real.
export async function addGoal(userId: string, goalType: string, targetAmount: number | null = null): Promise<GoalRecord> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({ user_id: userId, goal_type: goalType, target_amount: targetAmount })
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    } catch {
      // fall through to demo store
    }
  }
  return addDemoGoal(userId, goalType, targetAmount);
}

export interface FullGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  deadlineDate: string;
}

// The real, RLS-bypassing path for a user-created goal card (CreateGoalSheet).
// Postgres RLS on public.goals checks auth.uid(), which this backend's own
// JWT never populates — going straight through Backend/app's own Postgres
// connection (see Backend/app/goals.py) is what actually persists it past
// a reinstall. Returns false (not a throw) when there's no session/backend
// configured, so the caller can keep its existing local-only fallback.
export async function createGoal(goal: FullGoal): Promise<boolean> {
  const session = await getSession();
  if (!isDataApiConfigured || !session?.accessToken) return false;
  try {
    await postJsonAuthed('/goals', session.accessToken, goal);
    return true;
  } catch {
    return false;
  }
}

export async function listGoals(): Promise<FullGoal[]> {
  const session = await getSession();
  if (!isDataApiConfigured || !session?.accessToken) return [];
  try {
    const data = await getJson<{ goals: FullGoal[] }>('/goals', session.accessToken);
    return data.goals;
  } catch {
    return [];
  }
}
