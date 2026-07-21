// The DPDP-style consent audit trail. Call logConsent() for every grant —
// including the mocked AA link in this build phase, per the instruction to
// build the audit-trail habit in now rather than once "real" data exists.
// A row here is a fact about what the user agreed to and when, independent
// of whether the underlying integration (Setu, native SMS, push) is real
// yet.
import { supabase, isSupabaseConfigured } from '../auth';
import { addDemoConsent, readDemoData, revokeDemoConsent } from './demoStore';
import type { ConsentRecord, ConsentType } from './types';

function mapRow(row: {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted_at: string;
  revoked_at: string | null;
}): ConsentRecord {
  return { id: row.id, userId: row.user_id, consentType: row.consent_type, grantedAt: row.granted_at, revokedAt: row.revoked_at };
}

export async function logConsent(userId: string, consentType: ConsentType): Promise<ConsentRecord> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('consents')
      .insert({ user_id: userId, consent_type: consentType })
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  }
  return addDemoConsent(userId, consentType);
}

export async function revokeConsent(userId: string, consentType: ConsentType): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('consents')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .is('revoked_at', null);
    if (error) throw error;
    return;
  }
  await revokeDemoConsent(userId, consentType);
}

export async function listConsents(userId: string): Promise<ConsentRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }
  const demo = await readDemoData(userId);
  return [...demo.consents].reverse();
}
