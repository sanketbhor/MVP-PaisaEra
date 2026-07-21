import { supabase, isSupabaseConfigured } from '../auth';
import { readDemoData, updateDemoProfile } from './demoStore';
import type { UserProfile } from './types';

function mapRow(row: { id: string; name: string | null; salary_date: number | null; created_at: string }): UserProfile {
  return { id: row.id, name: row.name, salaryDate: row.salary_date, createdAt: row.created_at };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  }
  const demo = await readDemoData(userId);
  return demo.profile;
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; salaryDate?: number | null },
): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .update({ name: updates.name, salary_date: updates.salaryDate })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  }
  return updateDemoProfile(userId, updates);
}
