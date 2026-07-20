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
}

export default function RecategorizeSheet({ visible, merchantName, onClose, onSelect }: Props) {
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
});
