import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import type { PersonaConfig } from '../explain';

export default function PersonaSwitcherPill({ persona, onPress }: { persona: PersonaConfig; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.pill}>
      <View style={[styles.avatar, { backgroundColor: persona.avatarBg }]}>
        <Text style={styles.avatarText}>{persona.emoji}</Text>
      </View>
      <Text style={styles.name}>{persona.name}</Text>
      <Text style={styles.chevron}>▾</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    paddingRight: 10,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13 },
  name: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textPrimary },
  chevron: { fontSize: 11, color: colors.textMuted },
});
