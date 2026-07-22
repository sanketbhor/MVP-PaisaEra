import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheet from './BottomSheet';
import { colors, fonts, radii } from '../theme/tokens';
import { formatINR } from '../utils/format';
import type { Goal } from '../engine';

const EMOJI_OPTIONS = ['🎯', '✈', '🛟', '💳', '🛍', '📱', '🏠'];
const MONTH_OPTIONS = [3, 6, 12, 24];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (goal: Goal) => void;
}

export default function CreateGoalSheet({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [amountText, setAmountText] = useState('');
  const [months, setMonths] = useState(6);

  const targetAmount = parseInt(amountText.replace(/[^0-9]/g, ''), 10) || 0;
  const canSave = name.trim().length > 0 && targetAmount > 0;
  const monthlyContribution = targetAmount > 0 ? Math.ceil(targetAmount / months) : 0;

  const handleSave = () => {
    if (!canSave) return;
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + months);
    onCreate({
      id: `goal-${Date.now()}`,
      emoji,
      name: name.trim(),
      targetAmount,
      savedAmount: 0,
      monthlyContribution,
      deadlineDate: deadline.toISOString().slice(0, 10),
    });
    setName('');
    setAmountText('');
    setEmoji(EMOJI_OPTIONS[0]);
    setMonths(6);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Naya goal"
      body="Kis cheez ke liye bacha rahe ho?"
    >
      <View style={styles.emojiRow}>
        {EMOJI_OPTIONS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            accessibilityRole="button"
            style={[styles.emojiChip, emoji === e && styles.emojiChipActive]}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Goal ka naam — jaise Goa trip"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <TextInput
        value={amountText}
        onChangeText={setAmountText}
        placeholder="Kitna chahiye? — jaise 50000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>Kab tak?</Text>
      <View style={styles.monthRow}>
        {MONTH_OPTIONS.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMonths(m)}
            accessibilityRole="button"
            style={[styles.monthChip, months === m && styles.monthChipActive]}
          >
            <Text style={[styles.monthText, months === m && styles.monthTextActive]}>
              {m < 12 ? `${m} mahine` : `${m / 12} saal`}
            </Text>
          </Pressable>
        ))}
      </View>

      {canSave && (
        <Text style={styles.projection}>
          Matlab {formatINR(monthlyContribution)}/mahina bachana hoga.
        </Text>
      )}

      <Pressable
        onPress={handleSave}
        accessibilityRole="button"
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
      >
        <Text style={styles.saveText}>Goal banao</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emojiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  emojiChip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiChipActive: { borderColor: colors.hero },
  emojiText: { fontSize: 18 },
  input: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontFamily: fonts.sansMedium,
    fontSize: 14.5,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 8,
  },
  monthRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  monthChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  monthChipActive: { borderColor: colors.hero, backgroundColor: 'rgba(63,122,92,.08)' },
  monthText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.textMuted2 },
  monthTextActive: { color: colors.hero },
  projection: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.textMuted2, marginBottom: 12 },
  saveBtn: {
    backgroundColor: colors.hero,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.heroOnColor },
});
