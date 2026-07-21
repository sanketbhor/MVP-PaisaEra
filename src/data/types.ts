export interface UserProfile {
  id: string;
  name: string | null;
  salaryDate: number | null; // day of month, 1-31
  createdAt: string;
}

export interface GoalRecord {
  id: string;
  userId: string;
  goalType: string;
  targetAmount: number | null;
  createdAt: string;
}

export type ConsentType = 'aa_linked' | 'sms_permission' | 'notifications';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  grantedAt: string;
  revokedAt: string | null;
}
