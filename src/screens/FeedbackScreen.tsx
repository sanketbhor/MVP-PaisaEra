import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Card from '../components/Card';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  onBack: () => void;
}

// Beta feedback collection. In production this would POST to a backend
// endpoint — this prototype has none, so submission just confirms locally.
// No PII beyond the free-text field is collected; nothing is sent anywhere.
export default function FeedbackScreen({ onBack }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Feedback</Text>
        </View>

        {submitted ? (
          <Card>
            <Text style={styles.thanksTitle}>Shukriya 🙏</Text>
            <Text style={styles.thanksBody}>
              Beta mein tera feedback seedha product team tak jaata hai. Agar kuch specific tootha hai,
              yahi se dubara bhej sakta hai.
            </Text>
          </Card>
        ) : (
          <>
            <Text style={styles.prompt}>Ab tak PaisaEra kaisa laga?</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)} accessibilityRole="button" hitSlop={6}>
                  <Text style={[styles.star, rating !== null && n <= rating && styles.starFilled]}>★</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Kuch bhi bata sakta hai (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Kya accha laga, kya kharab, kya missing hai…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              style={styles.textarea}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!rating}
              accessibilityRole="button"
              style={[styles.submitBtn, !rating && styles.submitBtnDisabled]}
            >
              <Text style={styles.submitText}>Bhejo</Text>
            </Pressable>
          </>
        )}
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
  prompt: { fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  star: { fontSize: 30, color: colors.trackBg },
  starFilled: { color: colors.amber },
  label: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.textMuted2, marginBottom: 8 },
  textarea: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.card,
    padding: 14,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  submitBtn: { backgroundColor: colors.hero, borderRadius: radii.input, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: colors.trackBg },
  submitText: { fontFamily: fonts.sans, fontSize: 14.5, color: '#fff' },
  thanksTitle: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.textPrimary, marginBottom: 6 },
  thanksBody: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: colors.textMuted2 },
});
