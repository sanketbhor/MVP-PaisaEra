import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import GoalCard from '../components/GoalCard';
import { NoGoalCard } from '../components/GoalProgressCard';
import { colors, fonts, radii } from '../theme/tokens';
import type { EngineInput } from '../engine';

interface Props {
  input: EngineInput;
  onOpenCreate: () => void;
}

export default function GoalsScreen({ input, onOpenCreate }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Goals</Text>
          <Pressable onPress={onOpenCreate} accessibilityRole="button" style={styles.addPill}>
            <Text style={styles.addPillText}>＋ Naya</Text>
          </Pressable>
        </View>

        {input.goals.length === 0 ? (
          <NoGoalCard onPress={onOpenCreate} />
        ) : (
          <View style={{ gap: 12 }}>
            {input.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} today={input.today} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontFamily: fonts.sans, fontSize: 20, color: colors.textPrimary },
  addPill: { backgroundColor: 'rgba(63,122,92,.12)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 6 },
  addPillText: { fontFamily: fonts.sans, fontSize: 12, color: colors.hero },
});
