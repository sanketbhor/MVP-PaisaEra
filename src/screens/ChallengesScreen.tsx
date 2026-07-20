import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts, radii } from '../theme/tokens';
import { computeChallengeProgress } from '../engine';
import { CHALLENGES, BADGES } from '../content/challengesContent';

interface Props {
  today: string;
  onBack: () => void;
}

export default function ChallengesScreen({ today, onBack }: Props) {
  const [joinedIds, setJoinedIds] = useState<Set<string>>(
    () => new Set(CHALLENGES.filter((c) => c.joinedByDefault).map((c) => c.id)),
  );

  const handleJoin = (id: string) => {
    setJoinedIds((prev) => new Set(prev).add(id));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Challenges</Text>
        </View>

        {CHALLENGES.map((challenge) => {
          const isJoined = joinedIds.has(challenge.id);
          const progress = isJoined
            ? computeChallengeProgress(challenge.startDate, challenge.durationDays, today)
            : null;

          if (isJoined) {
            return (
              <Card key={challenge.id} style={styles.joinedCard}>
                <View style={styles.joinedHeaderRow}>
                  <View style={styles.titleRow}>
                    <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                    <Text style={styles.challengeName}>{challenge.name}</Text>
                  </View>
                  <View style={styles.joinedTag}>
                    <Text style={styles.joinedTagText}>{progress?.isComplete ? 'DONE' : 'JOINED'}</Text>
                  </View>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(progress?.pctComplete ?? 0) * 100}%` }]} />
                </View>
                <Text style={styles.challengeMeta}>
                  {challenge.description} {challenge.participantCount.toLocaleString('en-IN')} log saath mein.
                </Text>
              </Card>
            );
          }

          return (
            <Card key={challenge.id} style={styles.row}>
              <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeMeta}>{challenge.description}</Text>
              </View>
              <Pressable onPress={() => handleJoin(challenge.id)} accessibilityRole="button" style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>Join</Text>
              </Pressable>
            </Card>
          );
        })}

        <Text style={styles.sectionLabel}>Tere badges</Text>
        <View style={styles.badgeRow}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={{ alignItems: 'center' }}>
              <View style={[styles.badgeChip, !badge.earned && styles.badgeChipLocked]}>
                <Text style={styles.badgeIcon}>{badge.earned ? badge.icon : '🔒'}</Text>
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
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
  joinedCard: { borderWidth: 2, borderColor: colors.hero, marginBottom: 12 },
  joinedHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  challengeIcon: { fontSize: 20 },
  challengeName: { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary },
  joinedTag: { backgroundColor: colors.insightBadgeBg, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  joinedTagText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.hero },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.trackBg, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.hero, borderRadius: 4 },
  challengeMeta: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted2, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 12 },
  joinBtn: { backgroundColor: colors.hero, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 7 },
  joinBtnText: { fontFamily: fonts.sansBold, fontSize: 12, color: '#fff' },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 10,
  },
  badgeRow: { flexDirection: 'row', gap: 12 },
  badgeChip: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeChipLocked: { backgroundColor: colors.trackBg, opacity: 0.6 },
  badgeIcon: { fontSize: 24 },
  badgeLabel: { fontFamily: fonts.sansRegular, fontSize: 10.5, color: colors.textMuted, marginTop: 4 },
});
