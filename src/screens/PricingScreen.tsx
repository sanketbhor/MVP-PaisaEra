import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts, radii } from '../theme/tokens';

interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
  proHighlighted?: boolean;
}

const ROWS: ComparisonRow[] = [
  { label: 'Linked accounts', free: '2', pro: '∞', proHighlighted: true },
  { label: 'AI messages / day', free: '20', pro: '∞', proHighlighted: true },
  { label: 'Personalities', free: 'Friend', pro: 'Sab 3', proHighlighted: true },
  { label: 'Savings goals', free: '1', pro: '∞', proHighlighted: true },
  { label: 'Voice, forecasts, Couple/Family/Business', free: '—', pro: '✓', proHighlighted: true },
];

type PlanKey = 'monthly' | 'yearly';

interface Props {
  onBack: () => void;
  onStartTrial: () => void;
}

export default function PricingScreen({ onBack, onStartTrial }: Props) {
  const [plan, setPlan] = useState<PlanKey>('yearly');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>PaisaEra Pro</Text>
        </View>

        <Text style={styles.headline}>Jab ready ho tab upgrade karo.</Text>
        <Text style={styles.subheadline}>
          Free plan hamesha kaam ka rahega — koi trick nahi, koi jhoothi urgency nahi.
        </Text>

        <View style={styles.tableHeaderRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.tableHeaderFree}>Free</Text>
          <Text style={styles.tableHeaderPro}>Pro</Text>
        </View>
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          {ROWS.map((row, i) => (
            <React.Fragment key={row.label}>
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowFreeValue}>{row.free}</Text>
                <Text style={[styles.rowProValue, row.proHighlighted && styles.rowProValueHighlighted]}>
                  {row.pro}
                </Text>
              </View>
              {i < ROWS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        <View style={styles.planRow}>
          <Pressable
            onPress={() => setPlan('monthly')}
            accessibilityRole="button"
            style={[styles.planCard, plan === 'monthly' && styles.planCardSelected]}
          >
            <Text style={styles.planLabel}>Monthly</Text>
            <Text style={styles.planPrice}>₹99</Text>
            <Text style={styles.planUnit}>/month</Text>
          </Pressable>
          <Pressable
            onPress={() => setPlan('yearly')}
            accessibilityRole="button"
            style={[styles.planCard, plan === 'yearly' && styles.planCardSelected]}
          >
            <Text style={styles.planLabel}>Yearly</Text>
            <Text style={styles.planPrice}>₹149</Text>
            <Text style={[styles.planUnit, { color: colors.hero, fontFamily: fonts.sansBold }]}>
              /mo · 2 mo free
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={onStartTrial} accessibilityRole="button" style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Pro try karo</Text>
        </Pressable>
        <Text style={styles.ctaFootnote}>Jab chaho cancel karo · paisa turant free plan pe wapas</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
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
  title: { fontFamily: fonts.sans, fontSize: 17, color: colors.textPrimary },
  headline: { fontFamily: fonts.sans, fontSize: 22, letterSpacing: -0.3, lineHeight: 28, color: colors.textPrimary, marginBottom: 4 },
  subheadline: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: colors.textMuted2, marginBottom: 18 },
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8 },
  tableHeaderFree: { width: 66, textAlign: 'center', fontFamily: fonts.sansBold, fontSize: 12, color: colors.textMuted2 },
  tableHeaderPro: { width: 66, textAlign: 'center', fontFamily: fonts.sansBold, fontSize: 12, color: colors.hero },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowLabel: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 13.5, color: colors.textPrimary },
  rowFreeValue: { width: 66, textAlign: 'center', fontFamily: fonts.monoRegular, fontSize: 13, color: colors.textPrimary },
  rowProValue: { width: 66, textAlign: 'center', fontFamily: fonts.monoRegular, fontSize: 13, color: colors.textMuted },
  rowProValueHighlighted: { color: colors.hero, fontFamily: fonts.mono },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 16 },
  planRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  planCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: colors.cardBg,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  planCardSelected: { borderColor: colors.hero },
  planLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.mono, fontSize: 18, color: colors.textPrimary, marginTop: 3 },
  planUnit: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.textMuted },
  ctaBtn: {
    backgroundColor: colors.hero,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaText: { fontFamily: fonts.sans, fontSize: 15, color: '#fff' },
  ctaFootnote: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
});
