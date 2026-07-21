import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
}

export default function GhostButton({ label, onPress, color }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.wrap}>
      <Text style={[styles.text, color ? { color } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 10, alignItems: 'center' },
  text: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
});
