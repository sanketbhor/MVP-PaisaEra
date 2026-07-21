import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import OnboardingScreenLayout from '../components/OnboardingScreenLayout';
import { colors, fonts, radii } from '../../theme/tokens';

interface Props {
  onNext: () => void;
  devPlatform: 'ios' | 'android';
  onSetDevPlatform: (p: 'ios' | 'android') => void;
}

export default function WelcomeScreen({ onNext, devPlatform, onSetDevPlatform }: Props) {
  return (
    <OnboardingScreenLayout
      footer={
        <>
          <PrimaryButton label="Shuru karo" onPress={onNext} />
          <GhostButton label="Pehle se account hai? Log in" onPress={onNext} />

          {/* Dev-only: this build only runs as a web preview, where Platform.OS
              is "web" — a real device build ignores this and uses the actual OS. */}
          {Platform.OS === 'web' && (
            <View style={styles.devRow}>
              <Text style={styles.devLabel}>Preview platform:</Text>
              <Pressable onPress={() => onSetDevPlatform('ios')} style={[styles.devPill, devPlatform === 'ios' && styles.devPillOn]}>
                <Text style={[styles.devPillText, devPlatform === 'ios' && styles.devPillTextOn]}>iOS</Text>
              </Pressable>
              <Pressable onPress={() => onSetDevPlatform('android')} style={[styles.devPill, devPlatform === 'android' && styles.devPillOn]}>
                <Text style={[styles.devPillText, devPlatform === 'android' && styles.devPillTextOn]}>Android</Text>
              </Pressable>
            </View>
          )}
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>₹</Text>
        </View>
        <Text style={styles.title}>The New Era of Money</Text>
        <Text style={styles.subtitle}>
          PaisaEra khud batata hai kya ho raha hai — koi aur finance app nahi jaha tumhe sab type karna
          pade.
        </Text>
      </View>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center' },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  iconText: { fontSize: 30, color: colors.heroOnColor, fontFamily: fonts.sansBold },
  title: { fontFamily: fonts.sansBold, fontSize: 34, letterSpacing: -0.8, lineHeight: 39, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 15.5, lineHeight: 24, color: colors.textMuted2, marginTop: 16 },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 18 },
  devLabel: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted },
  devPill: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: colors.hairlineStrong },
  devPillOn: { backgroundColor: colors.hero },
  devPillText: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.textMuted2 },
  devPillTextOn: { color: '#fff' },
});
