import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, confidenceBarsFilled, confidenceLabel, fonts, radii } from '../theme/tokens';
import type { SafeToSpendResult } from '../engine';
import { formatINR } from '../utils/format';

interface Props {
  breakdown: SafeToSpendResult;
  subLabel: string;
  ctaLabel: string;
  onPress: () => void;
}

export default function SafeToSpendHero({ breakdown, subLabel, ctaLabel, onPress }: Props) {
  const filled = confidenceBarsFilled[breakdown.confidence];
  const isDay1Estimate = breakdown.isEstimate;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Safe to spend today, tap to see the full breakdown"
      style={({ pressed }) => [
        styles.hero,
        { backgroundColor: isDay1Estimate ? colors.heroDay1 : colors.hero, opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>
          Aaj safe to spend{isDay1Estimate ? ' · estimate' : ''}
        </Text>
        <View style={styles.confidenceGroup}>
          <View style={styles.barsRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  { backgroundColor: i < filled ? colors.heroOnColor : 'rgba(255,255,255,.28)' },
                ]}
              />
            ))}
          </View>
          <Text style={styles.confidenceText}>{confidenceLabel[breakdown.confidence]}</Text>
        </View>
      </View>

      <Text style={styles.amount}>
        {isDay1Estimate ? '≈ ' : ''}
        {formatINR(breakdown.dailyBudget)}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomLeft}>{subLabel}</Text>
        <View style={styles.ctaPill}>
          <Text style={styles.ctaPillText}>{ctaLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radii.hero,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.heroOnColorMuted,
  },
  confidenceGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barsRow: { flexDirection: 'row', gap: 3 },
  bar: { width: 14, height: 5, borderRadius: 3 },
  confidenceText: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.heroOnColor },
  amount: {
    fontFamily: fonts.mono,
    fontSize: 48,
    letterSpacing: -1,
    lineHeight: 52,
    color: colors.heroOnColor,
    marginTop: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.2)',
  },
  bottomLeft: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.heroOnColorMuted },
  ctaPill: {
    backgroundColor: 'rgba(255,255,255,.16)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ctaPillText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.heroOnColor },
});
