import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts } from '../theme/tokens';

interface Props {
  label: string;
  body: string;
  onPressWhy: () => void;
}

export default function InsightCard({ label, body, onPressWhy }: Props) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>P</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
      <Pressable onPress={onPressWhy} hitSlop={8} accessibilityRole="button">
        <Text style={styles.why}>Yeh kyun? →</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.mono, fontSize: 12, fontWeight: '700', color: colors.hero },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  body: { fontFamily: fonts.sansRegular, fontSize: 14.5, lineHeight: 21, color: colors.textPrimary },
  why: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.hero, marginTop: 9 },
});
