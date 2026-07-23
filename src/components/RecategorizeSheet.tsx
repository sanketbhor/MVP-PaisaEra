import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, fonts, radii } from '../theme/tokens';
import type { TransactionCategory } from '../engine';

const CATEGORY_OPTIONS: { label: string; value: TransactionCategory; icon: string }[] = [
  { label: 'Fuel', value: 'Fuel', icon: '⛽' },
  { label: 'Food', value: 'Food', icon: '🍔' },
  { label: 'Groceries', value: 'Groceries', icon: '🛒' },
  { label: 'Transfer', value: 'Transfer', icon: '↔' },
  { label: 'Shopping', value: 'Shopping', icon: '🛍' },
];

interface Props {
  visible: boolean;
  merchantName: string | null;
  onClose: () => void;
  onSelect: (category: TransactionCategory) => void;
  onDelete: () => void;
}

export default function RecategorizeSheet({ visible, merchantName, onClose, onSelect, onDelete }: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Category badlo"
      body={`Paisa ne ${merchantName ?? 'ise'} guess kiya tha. Sahi category chuno — aage se yaad rahega.`}
    >
      <View style={styles.pillRow}>
        {CATEGORY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            accessibilityRole="button"
            style={styles.pill}
          >
            <Text style={styles.pillText}>
              {opt.icon} {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Pressable onPress={onDelete} accessibilityRole="button" style={styles.deleteRow}>
        <Text style={styles.deleteText}>🗑 Yeh transaction nahi hai — hata do</Text>
      </Pressable>
      <Text style={styles.deleteHint}>Jaise koi bill-due reminder galti se transaction ban gaya ho.</Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  pill: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.hairline, marginTop: 18, marginBottom: 4 },
  deleteRow: { paddingVertical: 12 },
  deleteText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.warnText },
  deleteHint: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: -6 },
});
