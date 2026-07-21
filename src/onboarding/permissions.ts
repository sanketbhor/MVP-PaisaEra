// Native permission requests triggered from the onboarding explainer
// screens. The two are NOT equally real — see each function's comment.
import * as Notifications from 'expo-notifications';

export interface PermissionRequestResult {
  granted: boolean;
  isSimulated: boolean;
}

// Expo's managed workflow has no SDK module for Android's READ_SMS
// permission — reading SMS requires a custom native module (e.g.
// react-native-get-sms-android) wired in through a custom dev client or a
// bare build, neither of which exists in this project yet. This function is
// therefore a deliberate, clearly-labeled stand-in: it reflects the user's
// choice inside the app (which is what the consent record logs) but does
// NOT actually request an OS permission or read any SMS. Wire a real native
// module in here before shipping — do not remove this comment until you do.
export async function requestSmsPermission(userAllowed: boolean): Promise<PermissionRequestResult> {
  return { granted: userAllowed, isSimulated: true };
}

// This one is real: expo-notifications works in the managed workflow, and
// this actually fires the OS permission dialog.
export async function requestNotificationPermission(): Promise<PermissionRequestResult> {
  const { status } = await Notifications.requestPermissionsAsync();
  return { granted: status === 'granted', isSimulated: false };
}
