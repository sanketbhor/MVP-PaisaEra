// Shared local persistence for demo mode (no Supabase project configured).
// One JSON blob per user in SecureStore, standing in for what would be
// three Postgres tables. userService/goalService/consentService all read
// and write through here when isSupabaseConfigured is false, so demo mode
// is a fully working parallel path — not a stub that loses data on reload.
import { kvStore } from '../storage/kvStore';
import type { ConsentRecord, GoalRecord, UserProfile } from './types';

interface DemoUserData {
  profile: UserProfile;
  goals: GoalRecord[];
  consents: ConsentRecord[];
}

function storageKey(userId: string): string {
  return `paisaera-demo-data-${userId.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

function newId(): string {
  return `demo-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export async function readDemoData(userId: string): Promise<DemoUserData> {
  const raw = await kvStore.getItemAsync(storageKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw) as DemoUserData;
    } catch {
      // fall through to a fresh record
    }
  }
  return {
    profile: { id: userId, name: null, salaryDate: null, createdAt: new Date().toISOString() },
    goals: [],
    consents: [],
  };
}

async function writeDemoData(userId: string, data: DemoUserData): Promise<void> {
  await kvStore.setItemAsync(storageKey(userId), JSON.stringify(data));
}

export async function updateDemoProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'salaryDate'>>,
): Promise<UserProfile> {
  const data = await readDemoData(userId);
  data.profile = { ...data.profile, ...updates };
  await writeDemoData(userId, data);
  return data.profile;
}

export async function addDemoGoal(
  userId: string,
  goalType: string,
  targetAmount: number | null,
): Promise<GoalRecord> {
  const data = await readDemoData(userId);
  const goal: GoalRecord = { id: newId(), userId, goalType, targetAmount, createdAt: new Date().toISOString() };
  data.goals.push(goal);
  await writeDemoData(userId, data);
  return goal;
}

export async function addDemoConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
): Promise<ConsentRecord> {
  const data = await readDemoData(userId);
  const consent: ConsentRecord = {
    id: newId(),
    userId,
    consentType,
    grantedAt: new Date().toISOString(),
    revokedAt: null,
  };
  data.consents.push(consent);
  await writeDemoData(userId, data);
  return consent;
}

export async function revokeDemoConsent(userId: string, consentType: ConsentRecord['consentType']): Promise<void> {
  const data = await readDemoData(userId);
  const latest = [...data.consents].reverse().find((c) => c.consentType === consentType && !c.revokedAt);
  if (latest) {
    latest.revokedAt = new Date().toISOString();
    await writeDemoData(userId, data);
  }
}
