// Types for the phrasing layer. This is the stand-in for what will eventually
// be an AI layer: it receives only structured engine output (numbers,
// provenance) and turns it into Hinglish UI copy. It never sees raw
// transactions except to resolve provenance ids into display rows — it does
// no arithmetic of its own.

import type { ConfidenceLevel } from '../theme/tokens';
import type { NavigableTab } from '../nlq';

export interface SourceRecord {
  icon: string;
  label: string;
  amount: number | null;
  dateLabel: string | null;
}

export interface ChatResponseText {
  text: string;
  confidence: ConfidenceLevel;
  sourceTab: NavigableTab | null;
  sourceLabel: string;
}

export interface WhyThisData {
  headline: string;
  dataPointsUsed: string[];
  missingData: string[];
  confidence: ConfidenceLevel;
  confidenceNote: string;
  sourceRecords: SourceRecord[];
}
