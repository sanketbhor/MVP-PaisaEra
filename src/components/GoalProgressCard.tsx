import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fonts, radii } from '../theme/tokens';
import { formatINR } from '../utils/format';
import { computeGoalProgressPct, computeGoalStatus } from '../engine';
import type { Goal } from '../engine';
import { formatMonthName } from '../utils/formatDate';

interface GoalProps {
  goal: Goal;
  today: string;
}

export function GoalProgressCard({ goal, today }: GoalProps) {
  const pct = computeGoalProgressPct(goal);
  const status = computeGoalStatus(goal, today);
  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {goal.emoji} {goal.name} · {formatMonthName(goal.deadlineDate)}
        </Text>
        <Text style={styles.amounts}>
          <Text style={styles.amountsSaved}>{formatINR(goal.savedAmount)}</Text> /{' '}
          {formatINR(goal.targetAmount)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.subtext}>
        {formatINR(goal.monthlyContribution)}/mo · {status.isOnTrack ? 'sahi ja raha hai' : 'peeche chal raha hai'}
      </Text>
    </Card>
  );
}

export function NoGoalCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.noGoalCard}>
        <Text style={styles.noGoalText}>Apna pehla goal set kar</Text>
        <Text style={styles.noGoalPlus}>＋</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 },
  title: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.textPrimary },
  amounts: { fontFamily: fonts.monoRegular, fontSize: 12.5, color: colors.textMuted2 },
  amountsSaved: { fontFamily: fonts.mono, color: colors.textPrimary },
  track: { height: 7, borderRadius: 4, backgroundColor: '#e8e6df', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.hero, borderRadius: 4 },
  subtext: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted, marginTop: 7 },
  noGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dashedBorder,
  },
  noGoalText: { fontFamily: fonts.sans, fontSize: 14, color: colors.hero },
  noGoalPlus: { fontSize: 16, color: colors.hero },
});
