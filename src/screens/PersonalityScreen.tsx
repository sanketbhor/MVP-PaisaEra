import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PersonaCard from '../components/PersonaCard';
import { colors, fonts } from '../theme/tokens';
import { PERSONALITIES } from '../explain';
import type { PersonaId } from '../explain';

interface Props {
  personaId: PersonaId;
  isPro: boolean;
  onSelectPersona: (id: PersonaId) => void;
  onRequestPro: () => void;
  onBack: () => void;
}

export default function PersonalityScreen({ personaId, isPro, onSelectPersona, onRequestPro, onBack }: Props) {
  const handlePress = (id: PersonaId) => {
    const persona = PERSONALITIES[id];
    if (!persona.isFree && !isPro) {
      onRequestPro();
      return;
    }
    onSelectPersona(id);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Paisa ki personality</Text>
        </View>
        <Text style={styles.subtitle}>
          Ek hi baat, teen andaaz. Sun ke choose kar — sirf awaaz badalti hai, numbers wahi rehte hain.
        </Text>

        <View style={{ gap: 12 }}>
          {Object.values(PERSONALITIES).map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isSelected={persona.id === personaId}
              onPress={() => handlePress(persona.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: 24, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
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
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 20, color: colors.textMuted, marginTop: 10, marginBottom: 16 },
});
