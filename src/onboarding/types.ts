export type OnboardingStepId =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'name'
  | 'salary'
  | 'goal'
  | 'connect'
  | 'aa'
  | 'sms'
  | 'notif'
  | 'home';

export type ConnectPath = 'link' | 'manual';

export interface OnboardingAnswers {
  phoneLocal: string; // 10-digit local number, no +91
  name: string;
  salaryDate: number | null;
  goalType: string | null;
  bankId: string | null; // chosen bank when path === 'link'
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  phoneLocal: '',
  name: '',
  salaryDate: null,
  goalType: null,
  bankId: null,
};

export interface OnboardingProgress {
  stepIndex: number;
  path: ConnectPath | null;
  answers: OnboardingAnswers;
}

export const EMPTY_PROGRESS: OnboardingProgress = {
  stepIndex: 0,
  path: null,
  answers: EMPTY_ANSWERS,
};

// Mirrors the source design's seq() exactly: connect-choice forks the path,
// the SMS-permission step only exists on Android, and every path rejoins at
// notifications → home.
export function computeSequence(isAndroid: boolean, path: ConnectPath | null): OnboardingStepId[] {
  const seq: OnboardingStepId[] = ['welcome', 'phone', 'otp', 'name', 'salary', 'goal', 'connect'];
  if (path === 'link') {
    seq.push('aa');
    if (isAndroid) seq.push('sms');
    seq.push('notif');
  } else if (path === 'manual') {
    if (isAndroid) seq.push('sms');
    seq.push('notif');
  }
  seq.push('home');
  return seq;
}
