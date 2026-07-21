import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import OnboardingScreenLayout from '../components/OnboardingScreenLayout';
import ProgressDots from '../components/ProgressDots';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  name: string;
  onChangeName: (value: string) => void;
  onNext: () => void;
}

export default function NameScreen({ name, onChangeName, onNext }: Props) {
  return (
    <OnboardingScreenLayout
      footer={<PrimaryButton label="Aage badho" onPress={onNext} disabled={name.trim().length === 0} />}
    >
      <ProgressDots filled={1} />
      <Text style={styles.title}>Name?</Text>
      <Text style={styles.subtitle}>Sirf greet karne ke liye — "Good morning, Sammy ☀"</Text>

      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Sammy"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary, marginTop: 24 },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  input: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: 24,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
});
