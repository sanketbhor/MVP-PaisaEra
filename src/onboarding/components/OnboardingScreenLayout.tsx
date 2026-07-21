import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  footer: React.ReactNode;
}

// Shared by every onboarding screen with a bottom-pinned CTA. Previously
// each screen was a plain View with a `<View style={{flex:1}}/>` spacer
// pushing the button to the bottom — that only worked when nothing needed
// to scroll, and on a real device the on-screen keyboard would cover the
// button entirely rather than push it up (confirmed on a physical Android
// device: the "OTP bhejo" button was hidden below the keyboard). This
// wraps content in a KeyboardAvoidingView + ScrollView so the footer stays
// reachable above the keyboard on any device size, and content scrolls
// instead of clipping on shorter screens.
export default function OnboardingScreenLayout({ children, footer }: Props) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 26, paddingTop: 12 },
  footer: { paddingHorizontal: 26, paddingBottom: 20, paddingTop: 8, gap: 10 },
});
