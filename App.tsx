import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import MainApp from './MainApp';
import AppSplashScreen from './src/components/AppSplashScreen';
import {
  OnboardingNavigator,
  isOnboardingComplete,
  loadCompletedPath,
  buildFreshEngineInput,
  resetOnboarding,
} from './src/onboarding';
import type { ConnectPath } from './src/onboarding';
import { getSession, signOut } from './src/auth';
import { getProfile } from './src/data';
import { colors } from './src/theme/tokens';
import type { EngineInput } from './src/engine';

SplashScreen.preventAutoHideAsync();

type Phase = 'checking' | 'onboarding' | 'main';

interface MainAppState {
  userName: string;
  freshInput: EngineInput;
}

// The prototype has no real backend data-accumulation pipeline, so "what
// should Home look like today" for an already-onboarded user is re-derived
// fresh on every launch from their saved name + which connect path they
// took (see buildFreshEngineInput) — not from any persisted transaction
// history. That's an accepted, honestly-labelled prototype limitation.
async function reconstructMainAppState(): Promise<MainAppState | null> {
  const session = await getSession();
  const path = await loadCompletedPath();
  if (!session || !path) return null;
  const profile = await getProfile(session.userId);
  return {
    userName: profile?.name || 'Tum',
    freshInput: buildFreshEngineInput(path),
  };
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
  });
  const [phase, setPhase] = useState<Phase>('checking');
  const [mainAppState, setMainAppState] = useState<MainAppState | null>(null);

  useEffect(() => {
    (async () => {
      const complete = await isOnboardingComplete();
      if (!complete) {
        setPhase('onboarding');
        return;
      }
      const state = await reconstructMainAppState();
      if (!state) {
        // Marked complete but session/path is missing (e.g. cleared storage) —
        // safest honest recovery is to restart onboarding, not crash.
        setPhase('onboarding');
        return;
      }
      setMainAppState(state);
      setPhase('main');
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleLogout = useCallback(async () => {
    await signOut();
    // Full reset, not just clearing the session — otherwise re-launching
    // would see isOnboardingComplete() still true and try (and fail) to
    // reconstruct state from a session that no longer exists.
    await resetOnboarding();
    setMainAppState(null);
    setPhase('onboarding');
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (phase === 'checking') {
    return (
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <AppSplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  if (phase === 'onboarding') {
    return (
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <OnboardingNavigator
            onComplete={(_session, answers, path) => {
              const resolvedPath: ConnectPath = path ?? 'manual';
              setMainAppState({
                userName: answers.name || 'Tum',
                freshInput: buildFreshEngineInput(resolvedPath),
              });
              setPhase('main');
            }}
          />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        <MainApp userName={mainAppState!.userName} freshInput={mainAppState!.freshInput} onLogout={handleLogout} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
});
