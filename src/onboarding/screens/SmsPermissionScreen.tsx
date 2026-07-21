import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import OnboardingScreenLayout from '../components/OnboardingScreenLayout';
import { colors, fonts } from '../../theme/tokens';
import { logConsent } from '../../data';
import { requestSmsPermission } from '../permissions';

interface Props {
  userId: string;
  onNext: () => void;
}

// Android-only — the navigator never mounts this on iOS at all (see
// useOnboardingFlow's computeSequence, which excludes the "sms" step
// entirely off-platform, not just hides the screen).
export default function SmsPermissionScreen({ userId, onNext }: Props) {
  const [busy, setBusy] = useState(false);

  const handleAllow = async () => {
    setBusy(true);
    const result = await requestSmsPermission(true);
    if (result.granted) await logConsent(userId, 'sms_permission');
    setBusy(false);
    onNext();
  };

  return (
    <OnboardingScreenLayout
      footer={
        <>
          <PrimaryButton label="Allow karo" onPress={handleAllow} loading={busy} />
          <GhostButton label="Abhi nahi" onPress={onNext} />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>💬</Text>
        </View>
        <Text style={styles.title}>SMS padhne ki permission?</Text>
        <Text style={styles.subtitle}>
          Taaki woh transactions bhi pakad sakein jo tera bank Account Aggregator se share nahi karta.
          Sirf transaction SMS — personal messages kabhi nahi.
        </Text>
        <View style={styles.lockRow}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Sab kuch tere phone pe process hota hai.</Text>
        </View>
      </View>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: { fontSize: 26 },
  title: { fontFamily: fonts.sans, fontSize: 23, letterSpacing: -0.3, lineHeight: 29, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14.5, lineHeight: 22, color: colors.textMuted2, marginTop: 12 },
  lockRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  lockIcon: { fontSize: 12 },
  lockText: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted },
});
