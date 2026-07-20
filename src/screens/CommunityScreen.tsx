import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts } from '../theme/tokens';
import { computeCategorySpendPctOfIncome } from '../engine';
import type { EngineInput } from '../engine';
import { FOOD_SPEND_BENCHMARK, COMMUNITY_WINS } from '../content/communityContent';

interface Props {
  input: EngineInput;
}

// Bars are scaled against this ceiling so the two are visually comparable —
// most food-spend-to-income ratios fall well under it.
const BAR_SCALE_MAX_PCT = 0.3;

export default function CommunityScreen({ input }: Props) {
  const foodBudget = input.categoryBudgets.find((b) => b.category === FOOD_SPEND_BENCHMARK.categoryLabel);
  const userShare = useMemo(
    () => (foodBudget ? computeCategorySpendPctOfIncome(foodBudget, input) : null),
    [foodBudget, input],
  );

  const userPct = userShare ? Math.round(userShare.pctOfIncome * 100) : null;
  const benchmarkPct = Math.round(FOOD_SPEND_BENCHMARK.peerAveragePctOfIncome * 100);
  const isBelowAverage = userPct !== null && userShare!.pctOfIncome < FOOD_SPEND_BENCHMARK.peerAveragePctOfIncome;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Anonymous · opt-in · sab kuch aggregate</Text>
        </View>

        <View style={styles.optInBanner}>
          <Text style={styles.optInText}>
            Tere jaise ({FOOD_SPEND_BENCHMARK.peerGroupLabel}) logon se compare — naam ya transactions
            kabhi share nahi hote.
          </Text>
        </View>

        {userPct !== null ? (
          <Card style={{ marginBottom: 14 }}>
            <Text style={styles.cardTitle}>{FOOD_SPEND_BENCHMARK.categoryLabel} pe kharcha · tere jaison ke saath</Text>

            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Tu — {userPct}% income</Text>
              <Text style={[styles.compareTag, { color: isBelowAverage ? colors.hero : colors.warnText }]}>
                {isBelowAverage ? 'niche average se' : 'upar average se'}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(userPct / (BAR_SCALE_MAX_PCT * 100), 1) * 100}%`, backgroundColor: colors.hero },
                ]}
              />
            </View>

            <View style={[styles.compareRow, { marginTop: 9 }]}>
              <Text style={styles.compareLabel}>Baaki log — ~{benchmarkPct}% avg</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(benchmarkPct / (BAR_SCALE_MAX_PCT * 100), 1) * 100}%`, backgroundColor: colors.amber },
                ]}
              />
            </View>
          </Card>
        ) : (
          <Card style={{ marginBottom: 14 }}>
            <Text style={styles.cardTitle}>Abhi compare karne laayak data nahi hai</Text>
            <Text style={styles.emptyBody}>
              Jaise-jaise tera spending pattern banega, hum tujhe apne jaise logon se honestly compare kar
              paayenge.
            </Text>
          </Card>
        )}

        <Text style={styles.sectionLabel}>Is hafte ki wins</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {COMMUNITY_WINS.map((win, i) => (
            <React.Fragment key={win.id}>
              <View style={styles.winRow}>
                <View style={styles.winIconChip}>
                  <Text style={styles.winIcon}>{win.icon}</Text>
                </View>
                <Text style={styles.winText}>{win.text}</Text>
              </View>
              {i < COMMUNITY_WINS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        <Text style={styles.footnote}>
          Community optional hai — chaho toh Profile se off kar sakte ho. Yeh trust build karta hai, paise
          nahi — isliye humari core priority nahi.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  title: { fontFamily: fonts.sans, fontSize: 20, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  optInBanner: {
    backgroundColor: colors.insightBadgeBg,
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },
  optInText: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 19, color: colors.heroDark },
  cardTitle: { fontFamily: fonts.sans, fontSize: 13.5, color: colors.textPrimary, marginBottom: 12 },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  compareLabel: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted },
  compareTag: { fontFamily: fonts.sans, fontSize: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.trackBg, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  emptyBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 19, color: colors.textMuted2 },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  winRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 15 },
  winIconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winIcon: { fontSize: 14 },
  winText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: 15 },
  footnote: { fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted, marginTop: 12 },
});
