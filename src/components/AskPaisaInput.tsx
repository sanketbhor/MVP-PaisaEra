import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme/tokens';

// Deliberately the least visually prominent element on the screen — a secondary
// entry point, not the product's focus. Opens the Chat tab.
export default function AskPaisaInput({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel="Ask Paisa"
    >
      <Text style={styles.placeholder}>Paisa se kuch bhi pooch…</Text>
      <View style={styles.sendBtn}>
        <Text style={styles.sendIcon}>↑</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBg,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  placeholder: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, color: colors.textMuted },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.iconBtn,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 14 },
});
