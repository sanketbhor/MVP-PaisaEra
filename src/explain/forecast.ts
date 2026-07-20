import type { ForecastResult } from '../engine';
import { formatINR } from '../utils/format';

export function buildForecastText(forecast: ForecastResult): string {
  if (forecast.isProjectedOverspend) {
    return `Isi raftar mein chale toh mahine ke end tak ${formatINR(Math.abs(forecast.projectedMonthEndRemaining))} kam pad sakta hai.`;
  }
  return `Isi raftar mein chale toh mahine ke end tak ${formatINR(forecast.projectedMonthEndRemaining)} bachega.`;
}
