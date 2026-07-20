import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, confidenceLabel, fonts } from '../theme/tokens';
import type { ConfidenceLevel } from '../theme/tokens';
import type { NavigableTab } from '../nlq';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  confidence?: ConfidenceLevel;
  sourceLabel?: string;
  sourceTab?: NavigableTab | null;
}

interface Props {
  message: ChatMessage;
  onSourcePress?: () => void;
}

export default function ChatBubble({ message, onSourcePress }: Props) {
  if (message.role === 'user') {
    return (
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.aiWrap}>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{message.text}</Text>
      </View>
      {message.sourceLabel && (
        <Pressable onPress={onSourcePress} accessibilityRole="button" style={styles.sourceLink}>
          <Text style={styles.sourceLinkText}>🔗 {message.sourceLabel} pe based ↗</Text>
        </Pressable>
      )}
      {message.confidence && message.confidence !== 'high' && (
        <Text style={styles.confidenceCaption}>Confidence: {confidenceLabel[message.confidence]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: colors.hero,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userText: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.heroOnColor },
  aiWrap: { alignSelf: 'flex-start', maxWidth: '88%' },
  aiBubble: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 13,
    shadowColor: '#1e1912',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  aiText: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.textPrimary },
  sourceLink: { marginTop: 7, marginHorizontal: 2 },
  sourceLinkText: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.hero },
  confidenceCaption: { fontFamily: fonts.sansRegular, fontSize: 10.5, color: colors.textMuted, marginTop: 3, marginHorizontal: 2 },
});
