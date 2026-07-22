import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { PERSONALITIES } from '../explain';
import type { PersonaId } from '../explain';
import { PROGRESSION_LEVELS, computeProgressionStatus } from '../engine';
import type { EngineInput, GamificationInput } from '../engine';

interface Props {
  userName: string;
  isPro: boolean;
  personaId: PersonaId;
  input: EngineInput;
  gamification: GamificationInput;
  onOpenPersonality: () => void;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onOpenLevel: () => void;
  onOpenMoneyPersonality: () => void;
  onOpenMarket: () => void;
  onOpenCouple: () => void;
  onOpenFamily: () => void;
  onOpenBusiness: () => void;
  onRequestPro: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  userName,
  isPro,
  personaId,
  input,
  gamification,
  onOpenPersonality,
  onOpenOnboarding,
  onOpenSettings,
  onOpenPricing,
  onOpenLevel,
  onOpenMoneyPersonality,
  onOpenMarket,
  onOpenCouple,
  onOpenFamily,
  onOpenBusiness,
  onRequestPro,
  onLogout,
}: Props) {
  const persona = PERSONALITIES[personaId];
  const progression = useMemo(
    () => (gamification.hasEnoughHistory ? computeProgressionStatus(gamification, input) : null),
    [gamification, input],
  );
  const currentLevel = progression ? PROGRESSION_LEVELS[progression.currentLevelIndex] : null;
  const nextLevel = progression ? PROGRESSION_LEVELS[progression.currentLevelIndex + 1] : null;

  const handleModePress = (navigate: () => void) => {
    if (!isPro) {
      onRequestPro();
      return;
    }
    navigate();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <Pressable onPress={onOpenPricing} accessibilityRole="button">
            <View style={styles.proCard}>
              <View>
                <Text style={styles.proTitle}>PaisaEra Pro</Text>
                <Text style={styles.proSubtitle}>Saari personalities, voice, forecasts</Text>
              </View>
              <View style={styles.proPricePill}>
                <Text style={styles.proPriceText}>See plans ›</Text>
              </View>
            </View>
          </Pressable>
        )}

        {currentLevel && (
          <Pressable onPress={onOpenLevel} accessibilityRole="button">
            <Card style={styles.journeyCard}>
              <View style={styles.journeyIconChip}>
                <Text style={styles.journeyIcon}>{currentLevel.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.journeyTitle}>
                  {currentLevel.name} · Lvl {progression!.currentLevelIndex + 1}
                </Text>
                <Text style={styles.journeySubtitle}>
                  {currentLevel.name}
                  {nextLevel ? ` → ${nextLevel.name}` : ' · max level'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </Pressable>
        )}
        <Pressable onPress={onOpenMoneyPersonality} accessibilityRole="button">
          <Card style={[styles.journeyCard, { marginBottom: 14 }]}>
            <View style={[styles.journeyIconChip, { backgroundColor: '#f0ead8' }]}>
              <Text style={styles.journeyIcon}>{gamification.personality.emoji || '🌱'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.journeyTitle}>Tera Money Personality</Text>
              <Text style={styles.journeySubtitle}>
                {gamification.hasEnoughHistory ? `${gamification.personality.name} · share karo` : 'Abhi seekh raha hoon'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        </Pressable>

        <Text style={styles.sectionLabel}>Modes</Text>
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
          <Pressable onPress={() => handleModePress(onOpenCouple)} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>💞</Text>
            <Text style={styles.rowLabel}>Couple mode</Text>
            <Text style={styles.proTag}>PRO</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={() => handleModePress(onOpenFamily)} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>👨‍👩‍👧</Text>
            <Text style={styles.rowLabel}>Family mode</Text>
            <Text style={styles.proTag}>PRO</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={() => handleModePress(onOpenBusiness)} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🏪</Text>
            <Text style={styles.rowLabel}>Business mode</Text>
            <Text style={styles.proTag}>PRO</Text>
          </Pressable>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
          <Pressable onPress={onOpenPersonality} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🎭</Text>
            <Text style={styles.rowLabel}>Personality</Text>
            <Text style={styles.rowValue}>{persona.name} ›</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={onOpenMarket} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>📋</Text>
            <Text style={styles.rowLabel}>Talk to a CA</Text>
            <Text style={styles.rowValue}>›</Text>
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

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
          <Pressable onPress={onLogout} accessibilityRole="button" style={styles.row}>
            <Text style={styles.rowIcon}>🚪</Text>
            <Text style={[styles.rowLabel, styles.logoutLabel]}>Logout</Text>
          </Pressable>
        </Card>

        <View style={styles.trustBanner}>
          <Text style={styles.trustIcon}>🛡</Text>
          <Text style={styles.trustText}>
            India ke Account Aggregator framework se powered · DPDP-aligned · encrypted
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  content: { padding: 24, paddingBottom: 12 },
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
  journeyCard: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 12 },
  journeyIconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyIcon: { fontSize: 22 },
  journeyTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  journeySubtitle: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  chevron: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 15 },
  rowIcon: { width: 22, textAlign: 'center', fontSize: 15 },
  rowLabel: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textPrimary },
  logoutLabel: { color: colors.warnText },
  rowValue: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted },
  proTag: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.warnText,
    backgroundColor: colors.warnBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
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
