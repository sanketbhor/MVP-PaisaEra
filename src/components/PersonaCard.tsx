import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts } from '../theme/tokens';
import type { PersonaConfig } from '../explain';

interface Props {
  persona: PersonaConfig;
  isSelected: boolean;
  onPress: () => void;
}

export default function PersonaCard({ persona, isSelected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={[styles.card, isSelected && styles.cardSelected]}>
        <View style={styles.headerRow}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: persona.avatarBg }]}>
              <Text style={styles.avatarText}>{persona.emoji}</Text>
            </View>
            <View>
              <Text style={styles.name}>
                {persona.name} · {persona.role}
              </Text>
              <Text style={styles.tagline}>{persona.tagline}</Text>
            </View>
          </View>
          {isSelected ? (
            <Text style={styles.selectedTag}>SELECTED · FREE</Text>
          ) : !persona.isFree ? (
            <Text style={styles.proTag}>PRO</Text>
          ) : null}
        </View>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>{persona.sampleQuote}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.hero },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15 },
  name: { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  tagline: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  selectedTag: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.hero },
  proTag: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    color: colors.warnText,
    backgroundColor: colors.warnBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  quoteBox: { backgroundColor: '#f4f1ea', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11 },
  quoteText: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: '#3a352d' },
});
