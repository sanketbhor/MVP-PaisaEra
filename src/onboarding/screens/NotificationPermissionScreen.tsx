import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import { colors, fonts } from '../../theme/tokens';
import { logConsent } from '../../data';
import { requestNotificationPermission } from '../permissions';

interface Props {
  userId: string;
  onNext: () => void;
}

export default function NotificationPermissionScreen({ userId, onNext }: Props) {
  const [busy, setBusy] = useState(false);

  const handleAllow = async () => {
    setBusy(true);
    const result = await requestNotificationPermission();
    if (result.granted) await logConsent(userId, 'notifications');
    setBusy(false);
    onNext();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
        <Text style={styles.title}>Zaroori baat pe hi tokenge</Text>
        <Text style={styles.subtitle}>
          Jaise "kal bijli ka bill due hai" — sirf tab jab kuch dhyaan dene layak ho. Spam nahi, aur
          kitni baar aaye woh baad mein control kar sakte ho.
        </Text>
      </View>

      <PrimaryButton label="Notifications on karo" onPress={handleAllow} loading={busy} />
      <GhostButton label="Abhi nahi" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 26, paddingTop: 12 },
  hero: { flex: 1, justifyContent: 'center' },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f0ead8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: { fontSize: 26 },
  title: { fontFamily: fonts.sans, fontSize: 23, letterSpacing: -0.3, lineHeight: 29, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14.5, lineHeight: 22, color: colors.textMuted2, marginTop: 12 },
});
