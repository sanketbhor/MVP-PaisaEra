import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import CreateGoalSheet from './src/components/CreateGoalSheet';
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
import type { EngineInput, Goal } from './src/engine';
import { DEFAULT_PERSONA_ID } from './src/explain';
import type { PersonaId } from './src/explain';
import { getSession } from './src/auth';
import { createGoal, listGoals, loadCreatedGoals, saveCreatedGoals } from './src/data';
import {
  fetchTransactions,
  isTransactionsApiConfigured,
  mapToEngineTransactions,
  syncSmsTransactions,
} from './src/sms';
import type { SyncResult } from './src/sms';
import { detectRecurringBills, deriveCategoryBudgets, filterToCurrentMonth } from './src/engine';
import type { RawTransaction, CadencePreference } from './src/engine';

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
  const insets = useSafeAreaInsets();
  const [isDay1, setIsDay1] = useState(true);
  const [tab, setTab] = useState<TabKey>('home');
  const [personaId, setPersonaId] = useState<PersonaId>(DEFAULT_PERSONA_ID);
  const [isPro, setIsPro] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [showProSheet, setShowProSheet] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildSeedMessages(establishedInput, DEFAULT_PERSONA_ID),
  );
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [createdGoals, setCreatedGoals] = useState<Goal[]>([]);
  const [realTransactions, setRealTransactions] = useState<RawTransaction[]>([]);
  const [cadencePreference, setCadencePreference] = useState<CadencePreference>('auto');
  const [smsFallbackEnabled, setSmsFallbackEnabled] = useState(false);
  const messagesUsedToday = messages.filter((m) => m.role === 'user').length;

  useEffect(() => {
    getSession().then((session) => {
      if (!session) return;
      // Backend/app now owns public.goals directly (bypasses the RLS gap
      // that silently dropped every created goal on the old Supabase path)
      // — prefer whatever it has; the on-device store is only a fallback
      // for demo mode / no backend configured.
      listGoals().then((goals) => {
        if (goals.length > 0) setCreatedGoals(goals);
        else loadCreatedGoals(session.userId).then(setCreatedGoals);
      });
      // Real parsed-SMS transactions (see src/sms) — populated once the
      // user grants SMS permission during onboarding and a 90-day backfill
      // finishes. Until then this stays empty and Home/Transactions keep
      // showing the honest "not enough data yet" state, same as before.
      refreshRealTransactions(session.accessToken);
    });
  }, []);

  const refreshRealTransactions = (accessToken?: string) => {
    if (!accessToken || !isTransactionsApiConfigured) return;
    fetchTransactions(accessToken)
      .then((remote) => setRealTransactions(mapToEngineTransactions(remote)))
      .catch(() => {});
  };

  // Manual re-sync (Settings → "SMS se abhi sync karo") — the same 90-day
  // backfill that runs once during onboarding, re-runnable any time e.g.
  // after the parser gets tuned for a bank format it missed the first time.
  const handleSyncSmsNow = async (): Promise<SyncResult | null> => {
    const session = await getSession();
    if (!session?.accessToken) return null;
    const result = await syncSmsTransactions(session.accessToken);
    if (result.ok) refreshRealTransactions(session.accessToken);
    return result;
  };

  const baseInput = isDay1 ? freshInput : establishedInput;
  // Real SMS-derived transactions only ever replace the honest, near-empty
  // Day-1 dataset — never the curated "established" demo used for web
  // preview testing. EngineInput.transactions is documented to hold only
  // the current calendar month (income/expense calculations sum it
  // directly with no date filtering of their own) — the full 90-day
  // history is kept separately for the pattern detectors below, which
  // need multiple months to find anything recurring.
  const withRealTx: EngineInput =
    isDay1 && realTransactions.length > 0
      ? (() => {
          const bills = detectRecurringBills(realTransactions, baseInput.today);
          return {
            ...baseInput,
            transactions: filterToCurrentMonth(realTransactions, baseInput.today),
            transactionsTrackedCount: realTransactions.length,
            bills,
            categoryBudgets: deriveCategoryBudgets(realTransactions, baseInput.today),
            billsAreEstimate: bills.length === 0,
          };
        })()
      : baseInput;
  const input: EngineInput =
    createdGoals.length > 0 ? { ...withRealTx, goals: [...withRealTx.goals, ...createdGoals] } : withRealTx;
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

  const handleCreateGoal = (goal: Goal) => {
    setCreatedGoals((prev) => {
      const next = [...prev, goal];
      // Best-effort persistence; the goal is already in local state either
      // way. createGoal is the real, RLS-bypassing path (Backend/app owns
      // public.goals directly) — saveCreatedGoals stays as a local
      // resilience cache for demo mode / no backend configured.
      getSession().then((session) => {
        if (session) {
          saveCreatedGoals(session.userId, next);
          createGoal(goal);
        }
      });
      return next;
    });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Android edge-to-edge draws behind the status bar by default —
          this pushes every tab's content below it in one place instead of
          touching each screen's own padding. */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
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
            {tab === 'goals' && <GoalsScreen input={input} onOpenCreate={() => setShowCreateGoal(true)} />}
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
                onSyncSmsNow={handleSyncSmsNow}
                cadencePreference={cadencePreference}
                onChangeCadencePreference={setCadencePreference}
                smsFallbackEnabled={smsFallbackEnabled}
                onToggleSmsFallback={() => setSmsFallbackEnabled((v) => !v)}
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
      <CreateGoalSheet visible={showCreateGoal} onClose={() => setShowCreateGoal(false)} onCreate={handleCreateGoal} />

      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  content: { flex: 1 },
});
