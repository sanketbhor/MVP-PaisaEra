import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import MoneyPersonalityScreen from './src/screens/MoneyPersonalityScreen';
import LevelScreen from './src/screens/LevelScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import CoupleModeScreen from './src/screens/CoupleModeScreen';
import FamilyModeScreen from './src/screens/FamilyModeScreen';
import BusinessModeScreen from './src/screens/BusinessModeScreen';
import CAMarketplaceScreen from './src/screens/CAMarketplaceScreen';
import PricingScreen from './src/screens/PricingScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import ProUpsellSheet from './src/components/ProUpsellSheet';
import type { ChatMessage } from './src/components/ChatBubble';
import BottomNav from './src/navigation/BottomNav';
import type { TabKey } from './src/navigation/BottomNav';
import { colors } from './src/theme/tokens';
import {
  establishedInput,
  establishedGamification,
  day1Gamification,
  establishedAppOpensLast7Days,
  day1AppOpensLast7Days,
} from './src/engine/mockData';
import type { EngineInput } from './src/engine';
import { DEFAULT_PERSONA_ID } from './src/explain';
import type { PersonaId } from './src/explain';

interface Props {
  // The user's real name, and the honest fresh-start EngineInput built from
  // what they actually did in onboarding (see src/onboarding/buildOnboardingInput.ts).
  // This is what "Day 4 →" shows. "Day 30 →" is still the curated
  // full-feature demo dataset — see the toggle below.
  userName: string;
  freshInput: EngineInput;
  onLogout: () => void;
}

export default function MainApp({ userName, freshInput, onLogout }: Props) {
  const [isDay1, setIsDay1] = useState(true);
  const [tab, setTab] = useState<TabKey>('home');
  const [personaId, setPersonaId] = useState<PersonaId>(DEFAULT_PERSONA_ID);
  const [isPro, setIsPro] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [showProSheet, setShowProSheet] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildSeedMessages(establishedInput, DEFAULT_PERSONA_ID),
  );
  const messagesUsedToday = messages.filter((m) => m.role === 'user').length;

  const input = isDay1 ? freshInput : establishedInput;
  const gamification = isDay1 ? day1Gamification : establishedGamification;
  const appOpensLast7Days = isDay1 ? day1AppOpensLast7Days : establishedAppOpensLast7Days;

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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                userName={userName}
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
            {tab === 'community' && (
              <CommunityScreen input={input} onOpenChallenges={() => setTab('challenges')} />
            )}
            {tab === 'challenges' && (
              <ChallengesScreen today={input.today} onBack={() => setTab('community')} />
            )}
            {tab === 'profile' && (
              <ProfileScreen
                userName={userName}
                isPro={isPro}
                personaId={personaId}
                input={input}
                gamification={gamification}
                onOpenPersonality={() => setShowPersonaPicker(true)}
                onOpenOnboarding={() => setTab('onboarding')}
                onOpenSettings={() => setTab('settings')}
                onOpenPricing={() => setTab('pricing')}
                onOpenLevel={() => setTab('level')}
                onOpenMoneyPersonality={() => setTab('moneyPersonality')}
                onOpenMarket={() => setTab('market')}
                onOpenCouple={() => setTab('couple')}
                onOpenFamily={() => setTab('family')}
                onOpenBusiness={() => setTab('business')}
                onRequestPro={() => setShowProSheet(true)}
                onLogout={onLogout}
              />
            )}
            {tab === 'settings' && (
              <SettingsScreen
                daysSinceInstall={input.daysTrackedWithApp}
                appOpensLast7Days={appOpensLast7Days}
                onBack={() => setTab('profile')}
                onOpenFeedback={() => setTab('feedback')}
              />
            )}
            {tab === 'feedback' && <FeedbackScreen onBack={() => setTab('settings')} />}
            {tab === 'onboarding' && (
              <OnboardingScreen onBack={() => setTab('profile')} onConnect={() => setTab('home')} />
            )}
            {tab === 'moneyPersonality' && (
              <MoneyPersonalityScreen input={input} gamification={gamification} onBack={() => setTab('profile')} />
            )}
            {tab === 'level' && (
              <LevelScreen input={input} gamification={gamification} onBack={() => setTab('profile')} />
            )}
            {tab === 'couple' && <CoupleModeScreen today={input.today} onBack={() => setTab('profile')} />}
            {tab === 'family' && <FamilyModeScreen onBack={() => setTab('profile')} />}
            {tab === 'business' && <BusinessModeScreen onBack={() => setTab('profile')} />}
            {tab === 'market' && <CAMarketplaceScreen onBack={() => setTab('profile')} />}
            {tab === 'pricing' && (
              <PricingScreen onBack={() => setTab('profile')} onStartTrial={handleUnlockPro} />
            )}
          </>
        )}
      </View>

      {tab !== 'onboarding' && <BottomNav active={tab} onChange={setTab} />}

      <ProUpsellSheet visible={showProSheet} onClose={() => setShowProSheet(false)} onUnlock={handleUnlockPro} />

      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  content: { flex: 1 },
});
