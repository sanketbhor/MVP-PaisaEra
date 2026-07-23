import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import type { CategorizedTransaction } from '../engine';
import { CATEGORY_ICON } from '../explain';

interface Props {
  transaction: CategorizedTransaction;
  onPress?: () => void;
}

export default function TransactionRow({ transaction, onPress }: Props) {
  const { icon, iconBg } = CATEGORY_ICON[transaction.category];
  const content = (
    <View style={styles.row}>
      <View style={[styles.iconChip, { backgroundColor: iconBg }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        {transaction.isConfirmed ? (
          <Text style={styles.confirmedLabel}>{transaction.category} · confirmed</Text>
        ) : (
          <View style={styles.guessRow}>
            <View style={styles.guessDot} />
            <Text style={styles.guessLabel}>{transaction.category}? · guess</Text>
          </View>
        )}
      </View>
      <Text style={styles.amount}>-{formatINR(transaction.amount)}</Text>
    </View>
  );

  // Always tappable, not just low-confidence guesses — a confirmed
  // category can still be wrong (a rule guessed badly, or the row is a
  // false-positive "transaction" from a misread SMS), and both need a way
  // back into the recategorize/delete sheet.
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  iconChip: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16 },
  merchant: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  confirmedLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.hero, marginTop: 2 },
  guessRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  guessDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: colors.warnText,
  },
  guessLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.warnText },
  amount: { fontFamily: fonts.mono, fontSize: 14.5, color: colors.textPrimary },
});
