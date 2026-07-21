// Storage adapter that hands Supabase's session persistence off to the
// platform's secure storage (iOS Keychain / Android Keystore) instead of
// plain AsyncStorage — this is what satisfies "session token stored
// securely, not plain local storage."
import { kvStore } from '../storage/kvStore';

export const ExpoSecureStoreAdapter = {
  getItem: (key: string) => kvStore.getItemAsync(key),
  setItem: (key: string, value: string) => kvStore.setItemAsync(key, value),
  removeItem: (key: string) => kvStore.deleteItemAsync(key),
};
