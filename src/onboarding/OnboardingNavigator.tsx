import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useOnboardingFlow } from './useOnboardingFlow';
import type { ConnectPath, OnboardingAnswers } from './types';
import { getSession } from '../auth';
import type { AppSession } from '../auth';
import { updateProfile, addGoal } from '../data';
import { saveCompletedPath } from './onboardingStorage';
import { colors } from '../theme/tokens';

import WelcomeScreen from './screens/WelcomeScreen';
import PhoneEntryScreen from './screens/PhoneEntryScreen';
import OtpScreen from './screens/OtpScreen';
import NameScreen from './screens/NameScreen';
import SalaryDateScreen from './screens/SalaryDateScreen';
import GoalScreen from './screens/GoalScreen';
import ConnectChoiceScreen from './screens/ConnectChoiceScreen';
import AAConsentScreen from './screens/AAConsentScreen';
import SmsPermissionScreen from './screens/SmsPermissionScreen';
import NotificationPermissionScreen from './screens/NotificationPermissionScreen';

interface Props {
  onComplete: (session: AppSession, answers: OnboardingAnswers, path: ConnectPath | null) => void;
}

export default function OnboardingNavigator({ onComplete }: Props) {
  const flow = useOnboardingFlow();
  const [session, setSession] = useState<AppSession | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(30);
  const [demoOtpCode, setDemoOtpCode] = useState<string | undefined>(undefined);
  const [finishing, setFinishing] = useState(false);

  // Resuming mid-flow past the OTP step needs the session that was already
  // established — re-check on mount rather than assuming it's gone.
  useEffect(() => {
    getSession().then((s) => {
      if (s) setSession(s);
    });
  }, []);

  useEffect(() => {
    if (flow.step !== 'home' || finishing) return;
    setFinishing(true);
    (async () => {
      if (session) {
        await updateProfile(session.userId, {
          name: flow.answers.name,
          salaryDate: flow.answers.salaryDate,
        });
        if (flow.answers.goalType) {
          await addGoal(session.userId, flow.answers.goalType);
        }
        if (flow.path) await saveCompletedPath(flow.path);
        await flow.finish();
        onComplete(session, flow.answers, flow.path);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.step, session]);

  if (flow.loading) {
    return <View style={{ flex: 1, backgroundColor: colors.screenBg }} />;
  }

  const screen = (() => {
    switch (flow.step) {
      case 'welcome':
        return <WelcomeScreen onNext={flow.next} devPlatform={flow.isAndroid ? 'android' : 'ios'} onSetDevPlatform={flow.setDevPlatform} />;

      case 'phone':
        return (
          <PhoneEntryScreen
            phoneLocal={flow.answers.phoneLocal}
            onChangePhone={(v) => flow.setAnswers({ phoneLocal: v })}
            onBack={flow.back}
            onSent={(cooldown, demoCode) => {
              setOtpCooldown(cooldown);
              setDemoOtpCode(demoCode);
              flow.next();
            }}
          />
        );

      case 'otp':
        return (
          <OtpScreen
            phoneLocal={flow.answers.phoneLocal}
            initialCooldownSeconds={otpCooldown}
            demoCode={demoOtpCode}
            onBack={flow.back}
            onVerified={(s) => {
              setSession(s);
              flow.next();
            }}
          />
        );

      case 'name':
        return <NameScreen name={flow.answers.name} onChangeName={(v) => flow.setAnswers({ name: v })} onNext={flow.next} />;

      case 'salary':
        return (
          <SalaryDateScreen
            salaryDate={flow.answers.salaryDate}
            onChangeSalaryDate={(v) => flow.setAnswers({ salaryDate: v })}
            onNext={flow.next}
            onSkip={flow.next}
          />
        );

      case 'goal':
        return (
          <GoalScreen
            goalType={flow.answers.goalType}
            onChangeGoalType={(v) => flow.setAnswers({ goalType: v })}
            onNext={flow.next}
            onSkip={flow.next}
          />
        );

      case 'connect':
        return <ConnectChoiceScreen onChooseLink={() => flow.choosePath('link')} onChooseManual={() => flow.choosePath('manual')} />;

      case 'aa':
        return session ? (
          <AAConsentScreen
            userId={session.userId}
            onBack={flow.back}
            onLinked={(bankId) => {
              flow.setAnswers({ bankId });
              flow.next();
            }}
          />
        ) : null;

      case 'sms':
        return session ? <SmsPermissionScreen userId={session.userId} onNext={flow.next} /> : null;

      case 'notif':
        return session ? <NotificationPermissionScreen userId={session.userId} onNext={flow.next} /> : null;

      case 'home':
        return <View style={{ flex: 1, backgroundColor: colors.screenBg }} />;

      default:
        return null;
    }
  })();

  return <View style={{ flex: 1, backgroundColor: colors.screenBg }}>{screen}</View>;
}
