import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  chipOn: { backgroundColor: colors.insightBadgeBg, borderColor: colors.hero },
  text: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.textPrimary },
  textOn: { fontFamily: fonts.sansBold, color: colors.heroDark },
});
