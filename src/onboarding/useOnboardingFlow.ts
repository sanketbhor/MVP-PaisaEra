import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { computeSequence, EMPTY_PROGRESS } from './types';
import type { ConnectPath, OnboardingAnswers, OnboardingProgress, OnboardingStepId } from './types';
import { loadProgress, markOnboardingComplete, saveProgress } from './onboardingStorage';

interface UseOnboardingFlowResult {
  loading: boolean;
  step: OnboardingStepId;
  stepIndex: number;
  sequence: OnboardingStepId[];
  answers: OnboardingAnswers;
  path: ConnectPath | null;
  isAndroid: boolean;
  // Dev-only: this app only ever runs as a web preview in this environment,
  // where Platform.OS is "web" — real device builds ignore this entirely
  // and use the real Platform.OS. See WelcomeScreen for the toggle UI.
  setDevPlatform: (p: 'ios' | 'android') => void;
  next: () => void;
  back: () => void;
  choosePath: (path: ConnectPath) => void;
  setAnswers: (partial: Partial<OnboardingAnswers>) => void;
  finish: () => Promise<void>;
}

export function useOnboardingFlow(): UseOnboardingFlowResult {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<OnboardingProgress>(EMPTY_PROGRESS);
  const [devPlatform, setDevPlatformState] = useState<'ios' | 'android'>('android');

  useEffect(() => {
    loadProgress().then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, []);

  const isAndroid = Platform.OS === 'web' ? devPlatform === 'android' : Platform.OS === 'android';
  const sequence = computeSequence(isAndroid, progress.path);
  const stepIndex = Math.min(progress.stepIndex, sequence.length - 1);
  const step = sequence[stepIndex];

  // Persisted reactively off `progress` (rather than inline in each mutator
  // below) so that callers can fire setAnswers() immediately followed by
  // next() in the same handler — as AAConsentScreen does when a bank is
  // picked — without the second call's stale closure clobbering the first.
  // Every mutator below uses the functional setState form for the same
  // reason: each one composes onto whatever the latest state actually is,
  // not whatever it was when the callback was created.
  useEffect(() => {
    if (!loading) saveProgress(progress);
  }, [progress, loading]);

  const next = useCallback(() => {
    setProgress((prev) => {
      const seq = computeSequence(isAndroid, prev.path);
      return { ...prev, stepIndex: Math.min(prev.stepIndex + 1, seq.length - 1) };
    });
  }, [isAndroid]);

  const back = useCallback(() => {
    setProgress((prev) => ({ ...prev, stepIndex: Math.max(prev.stepIndex - 1, 0) }));
  }, []);

  const choosePath = useCallback((path: ConnectPath) => {
    setProgress((prev) => ({ ...prev, path, stepIndex: prev.stepIndex + 1 }));
  }, []);

  const setAnswers = useCallback((partial: Partial<OnboardingAnswers>) => {
    setProgress((prev) => ({ ...prev, answers: { ...prev.answers, ...partial } }));
  }, []);

  const finish = useCallback(async () => {
    await markOnboardingComplete();
  }, []);

  return {
    loading,
    step,
    stepIndex,
    sequence,
    answers: progress.answers,
    path: progress.path,
    isAndroid,
    setDevPlatform: setDevPlatformState,
    next,
    back,
    choosePath,
    setAnswers,
    finish,
  };
}
