// Thin wrapper around react-native-get-sms-android, isolating the
// native-module boundary so the rest of the app never imports it directly.
// The library is Android-only and has no web/iOS implementation, so this
// resolves to an empty result there instead of throwing.
import { Platform } from 'react-native';

export interface RawSms {
  address: string;
  body: string;
  timestampMs: number;
}

interface SmsListItem {
  address?: string;
  body?: string;
  date: string; // epoch ms, as a string
}

export function isSmsReadingSupported(): boolean {
  return Platform.OS === 'android';
}

export async function readInboxSince(minDateMs: number): Promise<RawSms[]> {
  if (!isSmsReadingSupported()) return [];
  // Native modules can be undefined in Expo Go / not-yet-rebuilt dev
  // clients — fail soft rather than crash the SMS permission screen.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SmsAndroid = require('react-native-get-sms-android');
  if (!SmsAndroid) return [];

  const PAGE_SIZE = 200;
  const all: RawSms[] = [];
  let indexFrom = 0;

  // minDate is applied server-side by the native query; we just keep
  // paging by index until a short page signals there's nothing left.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await new Promise<SmsListItem[]>((resolve, reject) => {
      SmsAndroid.list(
        JSON.stringify({ box: 'inbox', minDate: minDateMs, indexFrom, maxCount: PAGE_SIZE }),
        (fail: string) => reject(new Error(fail)),
        (_count: number, smsListJson: string) => resolve(JSON.parse(smsListJson)),
      );
    });

    for (const item of page) {
      if (!item.body || !item.date) continue;
      all.push({
        address: item.address ?? 'unknown',
        body: item.body,
        timestampMs: parseInt(item.date, 10),
      });
    }

    if (page.length < PAGE_SIZE) break;
    indexFrom += PAGE_SIZE;
    if (indexFrom > 20000) break; // hard stop against a pathological inbox
  }

  return all;
}
