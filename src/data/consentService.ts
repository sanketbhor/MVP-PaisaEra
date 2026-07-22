// The DPDP-style consent audit trail. Call logConsent() for every grant —
// including the mocked AA link in this build phase, per the instruction to
// build the audit-trail habit in now rather than once "real" data exists.
// A row here is a fact about what the user agreed to and when, independent
// of whether the underlying integration (Setu, native SMS, push) is real
// yet.
import { supabase, isSupabaseConfigured, getSession } from '../auth';
import { getJson, postJsonAuthed, isDataApiConfigured } from './dataApiClient';
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

interface BackendConsent {
  id: string;
  consentType: ConsentType;
  grantedAt: string;
  revokedAt: string | null;
}

function mapBackendConsent(userId: string, c: BackendConsent): ConsentRecord {
  return { id: c.id, userId, consentType: c.consentType, grantedAt: c.grantedAt, revokedAt: c.revokedAt };
}

// Tries Backend/app's own Postgres connection first (see
// Backend/app/consents.py) — Postgres RLS on public.consents checks
// auth.uid(), which this backend's own JWT never populates, so the old
// Supabase PostgREST path below silently no-ops for every real user and
// only the demo store actually recorded anything. Kept as a fallback for
// when no session/backend is configured, same as everywhere else in this file.
export async function logConsent(userId: string, consentType: ConsentType): Promise<ConsentRecord> {
  const session = await getSession();
  if (isDataApiConfigured && session?.accessToken) {
    try {
      const data = await postJsonAuthed<{ consent: BackendConsent }>('/consents', session.accessToken, { consentType });
      return mapBackendConsent(userId, data.consent);
    } catch {
      // fall through
    }
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('consents')
        .insert({ user_id: userId, consent_type: consentType })
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    } catch {
      // fall through to demo store
    }
  }
  return addDemoConsent(userId, consentType);
}

export async function revokeConsent(userId: string, consentType: ConsentType): Promise<void> {
  const session = await getSession();
  if (isDataApiConfigured && session?.accessToken) {
    try {
      await postJsonAuthed(`/consents/${consentType}/revoke`, session.accessToken);
      return;
    } catch {
      // fall through
    }
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('consents')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .is('revoked_at', null);
      if (error) throw error;
      return;
    } catch {
      // fall through to demo store
    }
  }
  await revokeDemoConsent(userId, consentType);
}

export async function listConsents(userId: string): Promise<ConsentRecord[]> {
  const session = await getSession();
  if (isDataApiConfigured && session?.accessToken) {
    try {
      const data = await getJson<{ consents: BackendConsent[] }>('/consents', session.accessToken);
      return data.consents.map((c) => mapBackendConsent(userId, c));
    } catch {
      // fall through
    }
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    } catch {
      // fall through to demo store
    }
  }
  const demo = await readDemoData(userId);
  return [...demo.consents].reverse();
}
