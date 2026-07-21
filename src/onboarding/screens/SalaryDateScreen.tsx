import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import ProgressDots from '../components/ProgressDots';
import Chip from '../components/Chip';
import { colors, fonts } from '../../theme/tokens';

const DATE_OPTIONS = [28, 30, 1, 5, 7, 10];

interface Props {
  salaryDate: number | null;
  onChangeSalaryDate: (value: number | null) => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function SalaryDateScreen({ salaryDate, onChangeSalaryDate, onNext, onSkip }: Props) {
  return (
    <View style={styles.screen}>
      <ProgressDots filled={2} />
      <Text style={styles.title}>Salary kab aati hai?</Text>
      <Text style={styles.subtitle}>Isse Safe to Spend calculate kar paate hain — pattern seekhne se pehle bhi.</Text>

      <Card style={{ marginTop: 22 }}>
        <Text style={styles.cardLabel}>Har mahine ki taareekh</Text>
        <View style={styles.chipRow}>
          {DATE_OPTIONS.map((day) => (
            <Chip
              key={day}
              label={day === 1 ? '1st' : String(day)}
              selected={salaryDate === day}
              onPress={() => onChangeSalaryDate(day)}
            />
          ))}
        </View>
      </Card>

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>ℹ</Text>
        <Text style={styles.infoText}>
          Skip karoge toh Safe to Spend ek lower-confidence estimate use karega — poori tarah honest
          rahega.
        </Text>
      </View>

      <View style={{ flex: 1 }} />
      <PrimaryButton label="Aage badho" onPress={onNext} disabled={salaryDate === null} />
      <GhostButton label="Abhi skip karo" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 26, paddingTop: 12 },
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary, marginTop: 24 },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  cardLabel: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'flex-start' },
  infoIcon: { fontSize: 12 },
  infoText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
});
