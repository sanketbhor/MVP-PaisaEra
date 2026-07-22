import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import OnboardingScreenLayout from '../components/OnboardingScreenLayout';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  onChooseLink: () => void;
  onChooseManual: () => void;
}

export default function ConnectChoiceScreen({ onChooseLink, onChooseManual }: Props) {
  return (
    <OnboardingScreenLayout footer={null}>
      <Text style={styles.title}>Data kaise jodenge?</Text>
      <Text style={styles.subtitle}>Dono theek hain. Baad mein kabhi bhi badal sakte ho.</Text>

      <Pressable onPress={onChooseLink} accessibilityRole="button">
        <Card style={styles.optionCardHighlighted}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🏦</Text>
            </View>
            <View>
              <Text style={styles.optionTitle}>Bank account link karo</Text>
              <Text style={styles.optionTagRecommended}>Recommended · auto-tracking</Text>
            </View>
          </View>
          <Text style={styles.optionBody}>
            Account Aggregator ke through — password kabhi share nahi hota. Sab kuch apne aap track
            hota hai.
          </Text>
        </Card>
      </Pressable>

      <Pressable onPress={onChooseManual} accessibilityRole="button">
        <Card style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={[styles.optionIcon, { backgroundColor: '#f0ead8' }]}>
              <Text style={styles.optionIconText}>✍</Text>
            </View>
            <View>
              <Text style={styles.optionTitle}>Abhi manually add karta hoon</Text>
              <Text style={styles.optionTagValid}>Bilkul valid choice</Text>
            </View>
          </View>
          <Text style={styles.optionBody}>
            Kharche khud add karo. App lower-confidence mode mein chalega — jab ready ho tab bank link
            kar dena.
          </Text>
        </Card>
      </Pressable>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.sans, fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary, marginTop: 6 },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textMuted2, marginTop: 8 },
  optionCardHighlighted: { marginTop: 22, borderWidth: 2, borderColor: colors.hero },
  optionCard: { marginTop: 12 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.insightBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconText: { fontSize: 18 },
  optionTitle: { fontFamily: fonts.sans, fontSize: 15.5, color: colors.textPrimary },
  optionTagRecommended: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.hero, marginTop: 1 },
  optionTagValid: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  optionBody: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted2 },
});
