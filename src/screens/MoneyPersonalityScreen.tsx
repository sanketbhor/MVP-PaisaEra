import React, { useMemo } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { PROGRESSION_LEVELS, computeProgressionStatus } from '../engine';
import type { EngineInput, GamificationInput } from '../engine';

interface Props {
  input: EngineInput;
  gamification: GamificationInput;
  onBack: () => void;
}

export default function MoneyPersonalityScreen({ input, gamification, onBack }: Props) {
  const { personality, hasEnoughHistory } = gamification;
  const status = useMemo(
    () => (hasEnoughHistory ? computeProgressionStatus(gamification, input) : null),
    [hasEnoughHistory, gamification, input],
  );
  const currentLevel = status ? PROGRESSION_LEVELS[status.currentLevelIndex] : null;

  const handleShare = () => {
    Share.share({
      message: `Meri PaisaEra Money Personality: ${personality.emoji} ${personality.name} — ${personality.tagline}`,
    }).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Tera Money Personality</Text>
        </View>

        {hasEnoughHistory ? (
          <>
            <View style={styles.gradientCard}>
              <Text style={styles.eyebrow}>PaisaEra · 2026 tak</Text>
              <Text style={styles.bigEmoji}>{personality.emoji}</Text>
              <Text style={styles.name}>{personality.name}</Text>
              <Text style={styles.tagline}>{personality.tagline}</Text>

              <View style={styles.statList}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>💪 Strength</Text>
                  <Text style={styles.statValue}>{personality.strength}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>👀 Weakness</Text>
                  <Text style={styles.statValue}>{personality.weakness}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>⚡ Superpower</Text>
                  <Text style={styles.statValue}>{personality.superpower}</Text>
                </View>
                {status && currentLevel && (
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🏆 Level</Text>
                    <Text style={styles.statValue}>
                      {currentLevel.name} · Lvl {status.currentLevelIndex + 1}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.lockNote}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockText}>
                Card pe kabhi balance, salary, ya credit score nahi dikhta — sirf aadaton ka framing.
              </Text>
            </View>

            <Pressable onPress={handleShare} accessibilityRole="button" style={styles.shareBtn}>
              <Text style={styles.shareText}>Share karo ↗</Text>
            </Pressable>
          </>
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>Abhi personality reveal nahi hui</Text>
            <Text style={styles.emptyBody}>
              Money Personality tere consistent behaviour se banti hai — abhi paas kaafi data nahi hai.
              Kuch hafte aur, phir dikhaunga.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  content: { padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: { fontSize: 17 },
  title: { fontFamily: fonts.sans, fontSize: 17, color: colors.textPrimary },
  gradientCard: {
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 26,
    backgroundColor: colors.heroDark,
    overflow: 'hidden',
  },
  eyebrow: { fontFamily: fonts.sans, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#bcd6c6' },
  bigEmoji: { fontSize: 52, lineHeight: 60, marginTop: 16, marginBottom: 8 },
  name: { fontFamily: fonts.sansBold, fontSize: 28, letterSpacing: -0.4, color: colors.heroOnColor },
  tagline: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: colors.heroOnColorMuted, marginTop: 6 },
  statList: { marginTop: 22, gap: 11 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.18)',
    paddingTop: 11,
  },
  statLabel: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: '#bcd6c6' },
  statValue: { fontFamily: fonts.sans, fontSize: 13, color: colors.heroOnColor, flexShrink: 1, textAlign: 'right' },
  lockNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 14 },
  lockIcon: { fontSize: 13 },
  lockText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted },
  shareBtn: {
    backgroundColor: colors.hero,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareText: { fontFamily: fonts.sans, fontSize: 14.5, color: '#fff' },
  emptyTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary, marginBottom: 6 },
  emptyBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted2 },
});
