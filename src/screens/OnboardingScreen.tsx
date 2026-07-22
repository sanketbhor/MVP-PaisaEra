import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '../theme/tokens';

const TRUST_POINTS = [
  'Hum tera bank password kabhi nahi dekhte',
  'Tera bank khud access authorize karta hai',
  'Consent jab chaho revoke kar sakte ho',
  'Tera data encrypted rehta hai',
];

// Modeled on a real Setu Account Aggregator consent artifact: what data,
// why, and for how long. Still mocked end-to-end — tapping through doesn't
// call a real Setu SDK, there's no backend to receive a real consent
// callback here. See the CTA handler below.
const CONSENT_DETAILS: { label: string; value: string }[] = [
  { label: 'Data types', value: 'Account balance, transaction history' },
  { label: 'Purpose', value: 'Spending insights aur safe-to-spend calculation' },
  { label: 'Fetch frequency', value: 'Periodic — jab tak consent active hai' },
  { label: 'Consent validity', value: '1 saal, renewable' },
  { label: 'Data sharing', value: 'Kisi teesre party ko share nahi hota' },
];

type Step = 'intro' | 'consent';

interface Props {
  onBack: () => void;
  onConnect: () => void;
}

// Mock only — this prototype has no real Setu AA SDK/backend wired in.
// "Connect" just simulates success and returns to Home, matching the source
// design's own onClick={{goHome}} behavior. The two-step flow (trust intro
// → explicit consent artifact) mirrors how a real AA consent request works.
export default function OnboardingScreen({ onBack, onConnect }: Props) {
  // BottomNav is hidden for this tab (see MainApp.tsx), so this screen's
  // own scroll content reaches the physical bottom edge and needs its own
  // inset — everywhere else, MainApp/BottomNav already handle it.
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('intro');

  if (step === 'consent') {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContentFlex, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => setStep('intro')} accessibilityRole="button" style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Setu se consent request</Text>
          <Text style={styles.subtitle}>
            Yeh exactly wahi consent hai jo tera bank dekhega — kuch chupa hua nahi.
          </Text>

          <View style={{ gap: 14, marginTop: 20 }}>
            {CONSENT_DETAILS.map((item) => (
              <View key={item.label} style={styles.consentRow}>
                <Text style={styles.consentLabel}>{item.label}</Text>
                <Text style={styles.consentValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onConnect} accessibilityRole="button" style={styles.connectBtn}>
              <Text style={styles.connectText}>Consent do &amp; connect karo</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContentFlex, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        </View>

        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🏦</Text>
        </View>
        <Text style={styles.title}>Apna bank safely link kar</Text>
        <Text style={styles.subtitle}>
          PaisaEra tere transactions padhta hai taaki hisaab khud bane. Password kabhi nahi maangte.
        </Text>

        <View style={styles.aaPill}>
          <Text style={styles.aaPillText}>Powered by Setu · India's Account Aggregator Framework</Text>
        </View>

        <View style={{ gap: 14 }}>
          {TRUST_POINTS.map((point) => (
            <View key={point} style={styles.trustRow}>
              <Text style={styles.trustCheck}>✓</Text>
              <Text style={styles.trustText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => setStep('consent')} accessibilityRole="button" style={styles.connectBtn}>
            <Text style={styles.connectText}>Account Aggregator se connect karo</Text>
          </Pressable>
          <Text style={styles.learnMore}>Yeh kaise kaam karta hai? Learn more</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContentFlex: { flexGrow: 1, padding: 24, paddingTop: 24 },
  headerRow: { marginBottom: 20 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: { fontSize: 17 },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconText: { fontSize: 28 },
  title: { fontFamily: fonts.sans, fontSize: 23, letterSpacing: -0.3, lineHeight: 29, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  aaPill: {
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginVertical: 17,
  },
  aaPillText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.heroDark, textAlign: 'center' },
  trustRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  trustCheck: { fontSize: 15, color: colors.hero, marginTop: 1 },
  trustText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  consentRow: { borderBottomWidth: 1, borderBottomColor: colors.hairline, paddingBottom: 12 },
  consentLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 3,
  },
  consentValue: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  footer: { marginTop: 'auto', paddingTop: 22 },
  connectBtn: {
    backgroundColor: colors.hero,
    borderRadius: radii.input,
    paddingVertical: 15,
    alignItems: 'center',
  },
  connectText: { fontFamily: fonts.sans, fontSize: 15, color: '#fff' },
  learnMore: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.hero, textAlign: 'center', marginTop: 12 },
});
