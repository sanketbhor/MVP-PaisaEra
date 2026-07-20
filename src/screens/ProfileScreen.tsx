import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { PERSONALITIES } from '../explain';
import type { PersonaId } from '../explain';

interface Props {
  userName: string;
  isPro: boolean;
  personaId: PersonaId;
  onOpenPersonality: () => void;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
  onOpenProSheet: () => void;
}

export default function ProfileScreen({
  userName,
  isPro,
  personaId,
  onOpenPersonality,
  onOpenOnboarding,
  onOpenSettings,
  onOpenProSheet,
}: Props) {
  const persona = PERSONALITIES[personaId];

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.planLine}>
              {isPro ? 'Pro plan' : 'Free plan'} · {persona.name} voice
            </Text>
          </View>
        </View>

        {!isPro && (
          <Pressable onPress={onOpenProSheet} accessibilityRole="button">
            <View style={styles.proCard}>
              <View>
                <Text style={styles.proTitle}>PaisaEra Pro</Text>
                <Text style={styles.proSubtitle}>Saari personalities, voice, forecasts</Text>
              </View>
              <View style={styles.proPricePill}>
                <Text style={styles.proPriceText}>₹99/mo</Text>
              </View>
            </View>
          </Pressable>
        )}

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
          <Pressable onPress={onOpenPersonality} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🎭</Text>
            <Text style={styles.rowLabel}>Personality</Text>
            <Text style={styles.rowValue}>{persona.name} ›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={onOpenOnboarding} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🏦</Text>
            <Text style={styles.rowLabel}>Connected accounts</Text>
            <Text style={[styles.rowValue, { color: colors.hero, fontFamily: fonts.sansBold }]}>2 linked ›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={onOpenSettings} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🔔</Text>
            <Text style={styles.rowLabel}>Notifications &amp; data</Text>
            <Text style={styles.rowValue}>›</Text>
          </Pressable>
        </Card>

        <View style={styles.trustBanner}>
          <Text style={styles.trustIcon}>🛡</Text>
          <Text style={styles.trustText}>
            India ke Account Aggregator framework se powered · DPDP-aligned · encrypted
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  content: { padding: 24 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 20, color: colors.heroOnColor },
  name: { fontFamily: fonts.sans, fontSize: 18, color: colors.textPrimary },
  planLine: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.hero,
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 15,
    marginBottom: 14,
  },
  proTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.heroOnColor },
  proSubtitle: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.heroOnColorMuted, marginTop: 2 },
  proPricePill: { backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  proPriceText: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.heroOnColor },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 15 },
  rowIcon: { width: 22, textAlign: 'center', fontSize: 15 },
  rowLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textPrimary },
  rowValue: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trustIcon: { fontSize: 13 },
  trustText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 12, lineHeight: 17, color: colors.heroDark },
});
