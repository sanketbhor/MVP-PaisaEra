// Persists onboarding progress so closing the app mid-flow resumes exactly
// where the user left off instead of restarting at Welcome. Kept in
// SecureStore alongside the session token — none of this is sensitive
// enough to require it, but it keeps the app to one storage mechanism
// rather than mixing SecureStore and AsyncStorage.
import { kvStore } from '../storage/kvStore';
import { EMPTY_PROGRESS } from './types';
import type { ConnectPath, OnboardingProgress } from './types';

const PROGRESS_KEY = 'paisaera-onboarding-progress';
const COMPLETE_KEY = 'paisaera-onboarding-complete';
const PATH_KEY = 'paisaera-onboarding-path';

export async function loadProgress(): Promise<OnboardingProgress> {
  const raw = await kvStore.getItemAsync(PROGRESS_KEY);
  if (!raw) return EMPTY_PROGRESS;
  try {
    return { ...EMPTY_PROGRESS, ...JSON.parse(raw) } as OnboardingProgress;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export async function saveProgress(progress: OnboardingProgress): Promise<void> {
  await kvStore.setItemAsync(PROGRESS_KEY, JSON.stringify(progress));
}

export async function clearProgress(): Promise<void> {
  await kvStore.deleteItemAsync(PROGRESS_KEY);
}

export async function isOnboardingComplete(): Promise<boolean> {
  return (await kvStore.getItemAsync(COMPLETE_KEY)) === 'true';
}

export async function markOnboardingComplete(): Promise<void> {
  await kvStore.setItemAsync(COMPLETE_KEY, 'true');
}

export async function resetOnboarding(): Promise<void> {
  await kvStore.deleteItemAsync(COMPLETE_KEY);
  await kvStore.deleteItemAsync(PATH_KEY);
  await clearProgress();
}

// Which connect-path the user finished onboarding with, re-loadable on a
// later app launch — the prototype has no real day-over-day data pipeline,
// so "what should Home look like today" is re-derived from this rather than
// from accumulated history. See buildOnboardingInput.ts.
export async function saveCompletedPath(path: ConnectPath): Promise<void> {
  await kvStore.setItemAsync(PATH_KEY, path);
}

export async function loadCompletedPath(): Promise<ConnectPath | null> {
  const raw = await kvStore.getItemAsync(PATH_KEY);
  return raw === 'link' || raw === 'manual' ? raw : null;
}
