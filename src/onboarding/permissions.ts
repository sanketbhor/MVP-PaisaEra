// Native permission requests triggered from the onboarding explainer
// screens.
import { PermissionsAndroid, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface PermissionRequestResult {
  granted: boolean;
  isSimulated: boolean;
}

// Real on Android (custom dev client, react-native-get-sms-android):
// fires the actual READ_SMS runtime permission dialog. On web/iOS there is
// no READ_SMS concept at all — iOS has no OS-level API for reading SMS,
// full stop, so this stays a clearly-labeled no-op there.
export async function requestSmsPermission(userAllowed: boolean): Promise<PermissionRequestResult> {
  if (!userAllowed) return { granted: false, isSimulated: false };
  if (Platform.OS !== 'android') return { granted: false, isSimulated: true };
  const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
    title: 'SMS padhne ki permission',
    message: 'Taaki transaction SMS se kharche track ho sakein. Personal messages kabhi nahi padhe jaate.',
    buttonPositive: 'Allow karo',
    buttonNegative: 'Cancel',
  });
  return { granted: status === PermissionsAndroid.RESULTS.GRANTED, isSimulated: false };
}

// This one is real: expo-notifications works in the managed workflow, and
// this actually fires the OS permission dialog.
export async function requestNotificationPermission(): Promise<PermissionRequestResult> {
  const { status } = await Notifications.requestPermissionsAsync();
  return { granted: status === 'granted', isSimulated: false };
}
