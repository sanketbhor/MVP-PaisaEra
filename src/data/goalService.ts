import { supabase, isSupabaseConfigured } from '../auth';
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

export async function addGoal(userId: string, goalType: string, targetAmount: number | null = null): Promise<GoalRecord> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: userId, goal_type: goalType, target_amount: targetAmount })
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  }
  return addDemoGoal(userId, goalType, targetAmount);
}
