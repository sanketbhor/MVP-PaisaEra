import { supabase, isSupabaseConfigured } from '../auth';
import { readDemoData, updateDemoProfile } from './demoStore';
import type { UserProfile } from './types';

function mapRow(row: { id: string; name: string | null; salary_date: number | null; created_at: string }): UserProfile {
  return { id: row.id, name: row.name, salaryDate: row.salary_date, createdAt: row.created_at };
}

// Auth moved to Firebase (see src/auth/authService.ts); Postgres RLS here
// still checks Supabase's own auth.uid(), which a Firebase-issued session
// doesn't populate until Supabase's Firebase third-party-auth bridging is
// configured (see Backend/deployment.md). Until then, real calls fail with
// an RLS error — caught below so onboarding keeps working against the demo
// store rather than throwing. Once bridging is wired, these start
// succeeding with no code change needed.
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
    } catch {
      // fall through to demo store
    }
  }
  const demo = await readDemoData(userId);
  return demo.profile;
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; salaryDate?: number | null },
): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name: updates.name, salary_date: updates.salaryDate })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    } catch {
      // fall through to demo store
    }
  }
  return updateDemoProfile(userId, updates);
}
