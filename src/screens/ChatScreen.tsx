import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import type { ChatMessage } from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import PersonaSwitcherPill from '../components/PersonaSwitcherPill';
import { colors, fonts } from '../theme/tokens';
import { routeQuery } from '../nlq';
import type { NavigableTab } from '../nlq';
import type { EngineInput } from '../engine';
import { PERSONALITIES, buildChatResponse } from '../explain';
import type { PersonaId } from '../explain';
import type { TabKey } from '../navigation/BottomNav';

export const DAILY_MESSAGE_LIMIT = 20;

let seedCounter = 0;
function nextId(prefix: string): string {
  seedCounter += 1;
  return `${prefix}-${seedCounter}`;
}

export function buildSeedMessages(input: EngineInput, personaId: PersonaId): ChatMessage[] {
  const seedQueries = ['Can I afford an iPhone?', 'Food pe kitna gaya is mahine?'];
  const messages: ChatMessage[] = [];
  for (const query of seedQueries) {
    messages.push({ id: nextId('seed-u'), role: 'user', text: query });
    const fact = routeQuery(query, input);
    const response = buildChatResponse(fact, personaId);
    messages.push({
      id: nextId('seed-a'),
      role: 'ai',
      text: response.text,
      confidence: response.confidence,
      sourceLabel: response.sourceTab ? response.sourceLabel : undefined,
      sourceTab: response.sourceTab,
    });
  }
  return messages;
}

const TAB_BY_NAVIGABLE: Record<NavigableTab, TabKey> = {
  home: 'home',
  transactions: 'transactions',
  budgets: 'budgets',
  goals: 'goals',
  subscriptions: 'subscriptions',
};

interface Props {
  input: EngineInput;
  personaId: PersonaId;
  messages: ChatMessage[];
  messagesUsedToday: number;
  onSendMessage: (userText: string, aiMessage: ChatMessage) => void;
  onOpenPersonaPicker: () => void;
  onNavigateTab: (tab: TabKey) => void;
}

export default function ChatScreen({
  input,
  personaId,
  messages,
  messagesUsedToday,
  onSendMessage,
  onOpenPersonaPicker,
  onNavigateTab,
}: Props) {
  const persona = PERSONALITIES[personaId];
  const scrollRef = useRef<ScrollView>(null);
  const remaining = Math.max(DAILY_MESSAGE_LIMIT - messagesUsedToday, 0);

  const handleSend = (text: string) => {
    const fact = routeQuery(text, input);
    const response = buildChatResponse(fact, personaId);
    const aiMessage: ChatMessage = {
      id: nextId('msg-a'),
      role: 'ai',
      text: response.text,
      confidence: response.confidence,
      sourceLabel: response.sourceTab ? response.sourceLabel : undefined,
      sourceTab: response.sourceTab,
    };
    onSendMessage(text, aiMessage);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ask Paisa</Text>
          <Text style={styles.subtitle}>
            Aaj {messagesUsedToday}/{DAILY_MESSAGE_LIMIT} messages
          </Text>
        </View>
        <PersonaSwitcherPill persona={persona} onPress={onOpenPersonaPicker} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onSourcePress={
              message.sourceTab ? () => onNavigateTab(TAB_BY_NAVIGABLE[message.sourceTab!]) : undefined
            }
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>🔒</Text>
          <Text style={styles.disclaimerText}>
            Paisa sirf tere real numbers explain karta hai — khud se calculate nahi karta. Investment
            advice abhi off hai.
          </Text>
        </View>
        <ChatInput remaining={remaining} dailyLimit={DAILY_MESSAGE_LIMIT} onSend={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 4,
  },
  title: { fontFamily: fonts.sans, fontSize: 20, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  messagesContent: { padding: 24, paddingTop: 14, gap: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 4, backgroundColor: colors.screenBg, gap: 10 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  disclaimerIcon: { fontSize: 11.5 },
  disclaimerText: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 11.5, lineHeight: 17, color: colors.textMuted },
});
