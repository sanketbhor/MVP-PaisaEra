// Shown while App.tsx's 'checking' phase runs its async onboarding/session
// lookup — bridges from the native static splash (assets/splash-icon.png,
// same badge+wordmark, configured in app.json) into the JS-rendered app,
// so there's no blank-screen flash between them. Matches the imported
// "PaisaEra Splash" design: near-black ground, teal badge with the rupee
// mark, white wordmark below, entering with a brief fade + scale.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../theme/tokens';

const SPLASH_BG = '#0a0a0c';
const BADGE_TEAL = '#14b8a6';
const BADGE_DARK = '#0a0a0c';

export default function AppSplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.group, { opacity, transform: [{ scale }] }]}>
        <View style={styles.badge}>
          <Text style={styles.rupee}>₹</Text>
        </View>
        <Text style={styles.wordmark}>PaisaEra</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SPLASH_BG, alignItems: 'center', justifyContent: 'center' },
  group: { alignItems: 'center' },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: BADGE_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupee: { fontFamily: fonts.sans, fontSize: 60, color: BADGE_DARK },
  wordmark: { fontFamily: fonts.sans, fontSize: 30, color: '#ffffff', marginTop: 18 },
});
