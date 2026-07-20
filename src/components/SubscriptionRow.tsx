import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { relativeRenewalLabel } from '../utils/formatDate';
import type { Bill } from '../engine';

interface Props {
  bill: Bill;
  today: string;
  onCancel: () => void;
}

export default function SubscriptionRow({ bill, today, onCancel }: Props) {
  const renewalLabel = relativeRenewalLabel(bill.dueDate, today);
  const isUrgent = renewalLabel.includes('renew');

  return (
    <View style={styles.row}>
      <View style={styles.iconChip}>
        <Text style={styles.icon}>{bill.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{bill.name}</Text>
        <Text style={[styles.renewal, isUrgent && styles.renewalUrgent]}>{renewalLabel}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>{formatINR(bill.amount)}</Text>
        <Pressable onPress={onCancel} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.cancelLink}>Cancel ↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 15 },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 17 },
  name: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  renewal: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  renewalUrgent: { fontFamily: fonts.sans, color: colors.warnText },
  amount: { fontFamily: fonts.mono, fontSize: 14, color: colors.textPrimary },
  cancelLink: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.hero, marginTop: 2 },
});
