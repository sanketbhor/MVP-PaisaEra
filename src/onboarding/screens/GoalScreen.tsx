import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import OnboardingScreenLayout from '../components/OnboardingScreenLayout';
import ProgressDots from '../components/ProgressDots';
import Chip from '../components/Chip';
import { colors, fonts } from '../../theme/tokens';

const GOAL_OPTIONS: { id: string; label: string }[] = [
  { id: 'trip', label: '✈ Trip ke liye' },
  { id: 'emergency-fund', label: '🛟 Emergency fund' },
  { id: 'debt', label: '💳 Debt chukana' },
  { id: 'big-purchase', label: '🛍 Badi kharidari' },
  { id: 'clarity', label: '🧭 Bas clarity chahiye' },
];

interface Props {
  goalType: string | null;
  onChangeGoalType: (value: string | null) => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function GoalScreen({ goalType, onChangeGoalType, onNext, onSkip }: Props) {
  return (
    <OnboardingScreenLayout
      footer={
        <>
          <PrimaryButton label="Aage badho" onPress={onNext} disabled={goalType === null} />
          <GhostButton label="Abhi skip karo" onPress={onSkip} />
        </>
      }
    >
      <ProgressDots filled={3} />
      <Text style={styles.title}>Koi ek goal? (optional)</Text>
      <Text style={styles.subtitle}>Baaki app real data se khud seekh lega. Ek chuno ya skip karo.</Text>

      <View style={styles.chipRow}>
        {GOAL_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={goalType === opt.id}
            onPress={() => onChangeGoalType(opt.id === goalType ? null : opt.id)}
          />
        ))}
      </View>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary, marginTop: 24 },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
});
