// Thin cross-platform key-value wrapper around expo-secure-store.
//
// On iOS/Android this is genuinely Keychain/Keystore-backed, which is what
// "session token stored securely, not plain local storage" requires.
// On web, expo-secure-store in this SDK has no working implementation
// (calling it throws "getValueWithKeyAsync is not a function") — web has no
// OS-level secure enclave to back it with anyway, so every call here falls
// through to plain localStorage instead. That's a real, documented
// reduction in guarantee for the web preview build only; native builds are
// unaffected. Every module that needs persistence (auth session, onboarding
// progress, demo data store) should go through this file rather than
// importing expo-secure-store directly, so the web fallback lives in one
// place.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const kvStore = { getItemAsync, setItemAsync, deleteItemAsync };
