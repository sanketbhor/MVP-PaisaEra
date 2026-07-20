import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  title: string;
  amount: string | null; // pre-formatted, or null when not yet known (Day-1)
  subtitle: string;
  tag: string;
  onPress?: () => void;
}

export default function BillCard({ title, amount, subtitle, tag, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined}>
      <Card style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {amount && <Text style={styles.amount}>{amount}</Text>}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary, flexShrink: 1 },
  amount: { fontFamily: fonts.mono, fontSize: 14.5, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  tagPill: {
    backgroundColor: colors.warnBg,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.warnText },
});
