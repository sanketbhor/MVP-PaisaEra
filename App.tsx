import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import SubscriptionsScreen from './src/screens/SubscriptionsScreen';
import ChatScreen, { buildSeedMessages } from './src/screens/ChatScreen';
import PersonalityScreen from './src/screens/PersonalityScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProUpsellSheet from './src/components/ProUpsellSheet';
import type { ChatMessage } from './src/components/ChatBubble';
import BottomNav from './src/navigation/BottomNav';
import type { TabKey } from './src/navigation/BottomNav';
import { colors } from './src/theme/tokens';
import { establishedInput, day1Input, USER_NAME } from './src/engine/mockData';
import { DEFAULT_PERSONA_ID } from './src/explain';
import type { PersonaId } from './src/explain';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
  });
  const [isDay1, setIsDay1] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');
  const [personaId, setPersonaId] = useState<PersonaId>(DEFAULT_PERSONA_ID);
  const [isPro, setIsPro] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [showProSheet, setShowProSheet] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildSeedMessages(establishedInput, DEFAULT_PERSONA_ID),
  );
  const messagesUsedToday = messages.filter((m) => m.role === 'user').length;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const input = isDay1 ? day1Input : establishedInput;
  const handleToggleDay1 = () => {
    setIsDay1((v) => !v);
    setTab('home');
  };

  const handleSendMessage = (userText: string, aiMessage: ChatMessage) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-u-${prev.length}`, role: 'user', text: userText },
      aiMessage,
    ]);
  };

  const handleNavigateFromChat = (targetTab: TabKey) => {
    setShowPersonaPicker(false);
    setTab(targetTab);
  };

  const handleUnlockPro = () => {
    setIsPro(true);
    setShowProSheet(false);
  };

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <View style={styles.content}>
        {showPersonaPicker ? (
          <PersonalityScreen
            personaId={personaId}
            isPro={isPro}
            onSelectPersona={(id) => {
              setPersonaId(id);
              setShowPersonaPicker(false);
            }}
            onRequestPro={() => setShowProSheet(true)}
            onBack={() => setShowPersonaPicker(false)}
          />
        ) : (
          <>
            {tab === 'home' && (
              <HomeScreen
                input={input}
                userName={USER_NAME}
                isDay1={isDay1}
                onToggleDay1={handleToggleDay1}
                onNavigate={setTab}
              />
            )}
            {tab === 'transactions' && <TransactionsScreen input={input} />}
            {tab === 'budgets' && <BudgetsScreen input={input} />}
            {tab === 'goals' && <GoalsScreen input={input} />}
            {tab === 'subscriptions' && <SubscriptionsScreen input={input} />}
            {tab === 'chat' && (
              <ChatScreen
                input={input}
                personaId={personaId}
                messages={messages}
                messagesUsedToday={messagesUsedToday}
                onSendMessage={handleSendMessage}
                onOpenPersonaPicker={() => setShowPersonaPicker(true)}
                onNavigateTab={handleNavigateFromChat}
              />
            )}
            {tab === 'community' && <CommunityScreen input={input} />}
            {tab === 'profile' && (
              <ProfileScreen
                userName={USER_NAME}
                isPro={isPro}
                personaId={personaId}
                onOpenPersonality={() => setShowPersonaPicker(true)}
                onOpenOnboarding={() => setTab('onboarding')}
                onOpenSettings={() => setTab('settings')}
                onOpenProSheet={() => setShowProSheet(true)}
              />
            )}
            {tab === 'settings' && <SettingsScreen onBack={() => setTab('profile')} />}
            {tab === 'onboarding' && (
              <OnboardingScreen onBack={() => setTab('profile')} onConnect={() => setTab('home')} />
            )}
          </>
        )}
      </View>

      {tab !== 'onboarding' && <BottomNav active={tab} onChange={setTab} />}

      <ProUpsellSheet visible={showProSheet} onClose={() => setShowProSheet(false)} onUnlock={handleUnlockPro} />

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  content: { flex: 1 },
});
