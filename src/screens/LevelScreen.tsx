import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { PROGRESSION_LEVELS, computeProgressionStatus } from '../engine';
import type { EngineInput, GamificationInput } from '../engine';
import { buildLevelStatusText } from '../explain';

interface Props {
  input: EngineInput;
  gamification: GamificationInput;
  onBack: () => void;
}

export default function LevelScreen({ input, gamification, onBack }: Props) {
  const status = useMemo(
    () => (gamification.hasEnoughHistory ? computeProgressionStatus(gamification, input) : null),
    [gamification, input],
  );
  const currentLevel = status ? PROGRESSION_LEVELS[status.currentLevelIndex] : null;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Tera safar</Text>
        </View>

        {status && currentLevel ? (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>{currentLevel.emoji}</Text>
              <Text style={styles.summaryName}>{currentLevel.name}</Text>
              <Text style={styles.summarySub}>
                Level {status.currentLevelIndex + 1} of {PROGRESSION_LEVELS.length}
              </Text>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${Math.min(status.pctAheadOfBaseline, 1) * 100}%` }]}
                />
              </View>
              <Text style={styles.summaryNote}>{buildLevelStatusText(status)}</Text>
            </Card>

            <Text style={styles.sectionLabel}>Levels</Text>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {PROGRESSION_LEVELS.map((level, i) => {
                const isDone = i < status.currentLevelIndex;
                const isCurrent = i === status.currentLevelIndex;
                const isLocked = i > status.currentLevelIndex;
                return (
                  <React.Fragment key={level.id}>
                    <View style={[styles.levelRow, isCurrent && styles.levelRowCurrent]}>
                      <Text style={styles.levelEmoji}>{level.emoji}</Text>
                      <Text style={[styles.levelName, isCurrent && styles.levelNameCurrent]}>{level.name}</Text>
                      {isDone && <Text style={styles.levelDone}>✓ done</Text>}
                      {isCurrent && <Text style={styles.levelHere}>TU YAHAN</Text>}
                      {isLocked && <Text style={styles.levelLocked}>locked</Text>}
                    </View>
                    {i < PROGRESSION_LEVELS.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </Card>
            <Text style={styles.footnote}>
              Progression sirf tere apne behaviour pe based hai — income kitni bhi ho, sab fairly aage
              badh sakte hain.
            </Text>
          </>
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>Safar abhi shuru hua hai</Text>
            <Text style={styles.emptyBody}>
              Level dikhane ke liye tera consistent saving pattern chahiye — abhi paas kaafi data nahi
              hai. Kuch hafte aur track karne do.
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
  summaryCard: { alignItems: 'center', paddingVertical: 20, marginBottom: 16 },
  summaryEmoji: { fontSize: 46 },
  summaryName: { fontFamily: fonts.sansBold, fontSize: 20, color: colors.textPrimary, marginTop: 8 },
  summarySub: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  track: { width: '100%', height: 9, borderRadius: 5, backgroundColor: colors.trackBg, overflow: 'hidden', marginTop: 14, marginBottom: 8 },
  fill: { height: '100%', backgroundColor: colors.hero, borderRadius: 5 },
  summaryNote: { fontFamily: fonts.sansRegular, fontSize: 12.5, lineHeight: 19, color: colors.textMuted2, textAlign: 'center' },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 2,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15, opacity: 0.55 },
  levelRowCurrent: { backgroundColor: colors.insightBadgeBg, opacity: 1, paddingVertical: 14 },
  levelEmoji: { fontSize: 18 },
  levelName: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textPrimary },
  levelNameCurrent: { fontFamily: fonts.sansBold },
  levelDone: { fontFamily: fonts.sans, fontSize: 12, color: colors.hero },
  levelHere: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.hero },
  levelLocked: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  footnote: { fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted, marginTop: 12 },
  emptyTitle: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary, marginBottom: 6 },
  emptyBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted2 },
});
