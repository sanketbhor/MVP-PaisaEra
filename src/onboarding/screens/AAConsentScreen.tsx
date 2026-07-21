import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import GhostButton from '../components/GhostButton';
import { colors, fonts } from '../../theme/tokens';
import { logConsent } from '../../data';

const TRUST_POINTS = [
  'Hum tera bank password kabhi nahi dekhte',
  'Tera bank khud access authorize karta hai',
  'Consent jab chaho revoke kar sakte ho',
  'Tera data encrypted rehta hai',
];

const BANKS = [
  { id: 'hdfc', icon: '🟦', name: 'HDFC' },
  { id: 'icici', icon: '🟧', name: 'ICICI' },
  { id: 'sbi', icon: '🟥', name: 'SBI' },
  { id: 'other', icon: '⋯', name: 'Aur' },
];

interface Props {
  userId: string;
  onBack: () => void;
  onLinked: (bankId: string) => void;
}

// Mocked/sandbox AA data for this build phase, per Phase 1 scope — tapping a
// bank never talks to Setu for real. What IS real: a consent record gets
// logged the moment a bank is picked, exactly like a live link would need.
export default function AAConsentScreen({ userId, onBack, onLinked }: Props) {
  const [linkingBankId, setLinkingBankId] = useState<string | null>(null);

  const handlePickBank = async (bankId: string) => {
    setLinkingBankId(bankId);
    await logConsent(userId, 'aa_linked');
    onLinked(bankId);
  };

  return (
    <View style={styles.screen}>
      <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🏦</Text>
      </View>
      <Text style={styles.title}>Bank safely link karo</Text>

      <View style={styles.aaPill}>
        <Text style={styles.aaPillText}>Powered by India's Account Aggregator Framework (via Setu)</Text>
      </View>

      <View style={{ gap: 13 }}>
        {TRUST_POINTS.map((point) => (
          <View key={point} style={styles.trustRow}>
            <Text style={styles.trustCheck}>✓</Text>
            <Text style={styles.trustText}>{point}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Apna bank chuno</Text>
      <View style={styles.bankRow}>
        {BANKS.map((bank) => (
          <Pressable key={bank.id} onPress={() => handlePickBank(bank.id)} accessibilityRole="button" style={{ flex: 1 }}>
            <Card style={styles.bankCard}>
              <Text style={styles.bankIcon}>{bank.icon}</Text>
              <Text style={styles.bankName}>{linkingBankId === bank.id ? 'Linking…' : bank.name}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <GhostButton label="Yeh kaise kaam karta hai? Learn more" onPress={() => {}} color={colors.hero} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 26, paddingTop: 12 },
  backBtn: { width: 34, marginBottom: 16 },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: { fontSize: 26 },
  title: { fontFamily: fonts.sans, fontSize: 22, letterSpacing: -0.3, lineHeight: 28, color: colors.textPrimary },
  aaPill: {
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginVertical: 16,
  },
  aaPillText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.heroDark, textAlign: 'center' },
  trustRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  trustCheck: { fontSize: 15, color: colors.hero, marginTop: 1 },
  trustText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 9,
  },
  bankRow: { flexDirection: 'row', gap: 9 },
  bankCard: { alignItems: 'center', paddingVertical: 13, paddingHorizontal: 6, gap: 4 },
  bankIcon: { fontSize: 16 },
  bankName: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.textPrimary },
});
