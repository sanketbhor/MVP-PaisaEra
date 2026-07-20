// Chat phrasing layer.
//
// ARCHITECTURAL BOUNDARY: the only input type this file accepts is `Fact`
// (from src/nlq), a plain-data snapshot of numbers/strings/booleans plus a
// Provenance of id references. `Fact` has no transaction/bill/goal RECORD on
// it anywhere — see src/nlq/types.ts. That means this file cannot perform a
// financial calculation even if it wanted to: the data it would need to
// calculate from was never passed in. All it can do is choose words around
// numbers that were already computed upstream by src/engine.
//
// This is also the seam where a real LLM would plug in later: swap the
// template functions below for a call to buildSystemPrompt(persona, fact) +
// an LLM completion, and nothing else in the app needs to change, because
// the LLM would receive exactly the same Fact — never raw transactions.

import { formatINR } from '../utils/format';
import type { ConfidenceLevel } from '../theme/tokens';
import type { Fact } from '../nlq';
import type { PersonaId } from './personalities';
import type { ChatResponseText } from './types';

const CONFIDENCE_CAVEAT: Record<PersonaId, Partial<Record<ConfidenceLevel, string>>> = {
  friend: {
    growing: ' (abhi kam data hai, pakka nahi bol sakta)',
    building: ' (data build ho raha hai, roughly sahi hai)',
  },
  papa: {
    growing: ' Data kam hai — guarantee nahi.',
    building: ' Pattern pakka nahi hua abhi.',
  },
  mom: {
    growing: ' Bas itna — abhi thoda kam data hai, isliye pakka nahi keh sakti.',
    building: ' Data thoda aur aane do, tab aur pakka bataungi.',
  },
};

function withCaveat(persona: PersonaId, confidence: ConfidenceLevel, text: string): string {
  const caveat = CONFIDENCE_CAVEAT[persona][confidence];
  return caveat ? text + caveat : text;
}

function affordabilityGoalText(persona: PersonaId, f: Extract<Fact, { kind: 'affordabilityGoal' }>): string {
  const lagega = f.projectedCompletionLabel ? `${f.projectedCompletionLabel} tak lagega` : 'abhi pace clear nahi';
  switch (persona) {
    case 'friend':
      return `Abhi tak ${formatINR(f.savedAmount)} jama hue hain, aur ${f.goalName} ${formatINR(f.targetAmount)} ka hai. Is raftaar (${formatINR(f.monthlyContribution)}/mo) pe ${f.isOnTrackForDeadline ? `${f.deadlineMonthLabel} ka deadline time pe ho jayega` : `${f.deadlineMonthLabel} miss ho jayega — actually ${lagega}`}. Chahe toh main ${formatINR(f.requiredMonthlyPaceForDeadline)}/mo ka plan bana du?`;
    case 'papa':
      return `${formatINR(f.savedAmount)} hai, ${formatINR(f.targetAmount)} chahiye — ${formatINR(f.remainingAmount)} baaki. ${formatINR(f.monthlyContribution)}/mo pe ${f.isOnTrackForDeadline ? `${f.deadlineMonthLabel} se pehle ho jayega.` : `${lagega}, ${f.deadlineMonthLabel} nahi.`} ${formatINR(f.requiredMonthlyPaceForDeadline)}/mo daalne ki himmat hai?`;
    case 'mom':
      return `Beta, abhi tak ${formatINR(f.savedAmount)} jama ho chuke hain — ${f.goalName} ke liye ${formatINR(f.targetAmount)} chahiye, toh ${formatINR(f.remainingAmount)} aur baaki hai. Is raftaar mein ${f.isOnTrackForDeadline ? `${f.deadlineMonthLabel} tak pahunch jaoge.` : `thoda time lagega, shayad ${lagega}.`} Chaho toh ${formatINR(f.requiredMonthlyPaceForDeadline)}/mo kar ke dekhte hain, jaldi ho jayega.`;
  }
}

function categorySpendText(persona: PersonaId, f: Extract<Fact, { kind: 'categorySpend' }>): string {
  const over = f.level === 'over';
  const pctLine =
    f.pctChangeVsLastMonth !== null
      ? `, pichle mahine se ${Math.abs(f.pctChangeVsLastMonth)}% ${f.pctChangeVsLastMonth > 0 ? 'upar' : 'neeche'}`
      : '';
  const topLine = f.topMerchant ? ` Zyadatar ${f.topMerchant} pe.` : '';
  switch (persona) {
    case 'friend':
      return `Is mahine ${formatINR(f.spent)} — ${f.category} budget ${formatINR(f.budgeted)} se ${over ? `${formatINR(Math.abs(f.remainingAmount))} zyada` : `${formatINR(Math.abs(f.remainingAmount))} kam`}${pctLine}.${topLine}`;
    case 'papa':
      return `${f.category} pe ${formatINR(f.spent)} gaye, budget ${formatINR(f.budgeted)} tha. ${over ? `${formatINR(Math.abs(f.remainingAmount))} zyada kharch — control kar.` : `${formatINR(Math.abs(f.remainingAmount))} bacha hai, theek hai.`}${topLine}`;
    case 'mom':
      return `Beta, ${f.category} pe is mahine ${formatINR(f.spent)} gaye — budget ${formatINR(f.budgeted)} tha, toh ${over ? `thoda zyada ho gaya, ${formatINR(Math.abs(f.remainingAmount))}` : `${formatINR(Math.abs(f.remainingAmount))} bacha hua hai, accha hai`}.${f.topMerchant ? ` Sabse zyada ${f.topMerchant} pe gaya — dhyan rakhna.` : ''}`;
  }
}

function safeToSpendText(persona: PersonaId, f: Extract<Fact, { kind: 'safeToSpend' }>): string {
  const est = f.isEstimate ? ' (estimate)' : '';
  switch (persona) {
    case 'friend':
      return `Aaj ka budget ${formatINR(f.dailyBudget)}${est} hai — ${formatINR(f.remaining)} bacha hai, ${f.daysRemainingInMonth} din baaki. Chill se spend kar.`;
    case 'papa':
      return `Aaj ${formatINR(f.dailyBudget)}${est} hi kharch karna hai. ${formatINR(f.remaining)} bacha hai ${f.daysRemainingInMonth} din ke liye. Hisaab se chal.`;
    case 'mom':
      return `Beta, aaj ${formatINR(f.dailyBudget)}${est} tak spend karna theek rahega — ${formatINR(f.remaining)} bacha hua hai ${f.daysRemainingInMonth} din ke liye. Apna khayal rakhna.`;
  }
}

function goalStatusText(persona: PersonaId, f: Extract<Fact, { kind: 'goalStatus' }>): string {
  switch (persona) {
    case 'friend':
      return `${f.goalName} ${f.isOnTrack ? 'on track hai' : 'thoda peeche hai'} — ${formatINR(f.savedAmount)}/${formatINR(f.targetAmount)}, ${formatINR(f.monthlyContribution)}/mo chal raha hai. ${f.isOnTrack ? `${f.deadlineMonthLabel} tak ho jayega.` : `${f.deadlineMonthLabel} ke liye ${formatINR(f.requiredMonthlyPace)}/mo chahiye.`}`;
    case 'papa':
      return `${f.goalName}: ${formatINR(f.savedAmount)}/${formatINR(f.targetAmount)}. ${f.isOnTrack ? 'Sahi chal raha hai.' : `Peeche hai — ${formatINR(f.requiredMonthlyPace)}/mo daal, warna ${f.deadlineMonthLabel} miss.`}`;
    case 'mom':
      return `Beta, ${f.goalName} ke liye ${formatINR(f.savedAmount)} jama ho chuke hain, ${formatINR(f.targetAmount)} tak pahunchna hai. ${f.isOnTrack ? `Bahut accha chal raha hai, ${f.deadlineMonthLabel} tak ho jayega.` : `Thoda aur badhana hoga — ${formatINR(f.requiredMonthlyPace)}/mo, tabhi ${f.deadlineMonthLabel} tak hoga.`}`;
  }
}

function subscriptionSpendText(persona: PersonaId, f: Extract<Fact, { kind: 'subscriptionSpend' }>): string {
  const merchants = f.recentRenewalMerchants.join(', ');
  const renewalLine =
    f.recentRenewalCount && f.recentRenewalAmount
      ? persona === 'papa'
        ? ` ${f.recentRenewalCount} abhi renew hue — ${formatINR(f.recentRenewalAmount)}. Sab use ho rahe hain?`
        : persona === 'mom'
          ? ` Inme se ${f.recentRenewalCount} is hafte renew hue — ${merchants}, ${formatINR(f.recentRenewalAmount)}. Dekh lena koi kaam ka na ho toh hata dena.`
          : ` ${f.recentRenewalCount} abhi renew hue — ${merchants}, ${formatINR(f.recentRenewalAmount)}.`
      : '';
  switch (persona) {
    case 'friend':
      return `${f.count} subscriptions chal rahe hain, ${formatINR(f.monthlyTotal)}/mo.${renewalLine}`;
    case 'papa':
      return `${f.count} subscriptions, ${formatINR(f.monthlyTotal)}/mo ja raha hai.${renewalLine}`;
    case 'mom':
      return `Beta, ${f.count} subscriptions hain abhi, ${formatINR(f.monthlyTotal)}/mo.${renewalLine}`;
  }
}

function unknownGoalText(persona: PersonaId, f: Extract<Fact, { kind: 'unknownGoal' }>): string {
  switch (persona) {
    case 'friend':
      return `"${f.askedName}" ke liye mere paas koi goal nahi hai abhi. Pehle ek goal bana de, phir main exact numbers bata sakta hoon.`;
    case 'papa':
      return `"${f.askedName}" ka koi goal set nahi hai. Pehle goal bana, tab baat karenge.`;
    case 'mom':
      return `Beta, "${f.askedName}" ka koi goal abhi bana nahi hai mere paas, isliye pakka nahi bata sakti. Ek goal set kar de, phir sahi se dekh sakte hain.`;
  }
}

function unknownQueryText(persona: PersonaId): string {
  switch (persona) {
    case 'friend':
      return 'Yeh main abhi samajh nahi paaya. Transactions, budgets, goals ya subscriptions ke baare mein pooch — main sirf unhi cheezon ka jawab de sakta hoon jo tere real data mein hai.';
    case 'papa':
      return 'Samajh nahi aaya. Seedha pooch — kharcha, budget, goal, subscription.';
    case 'mom':
      return 'Beta, yeh samajh nahi paayi. Apne kharche, budget, goal ya subscriptions ke baare mein pooch — tabhi sahi jawab de paungi.';
  }
}

export function buildChatResponse(fact: Fact, persona: PersonaId): ChatResponseText {
  let text: string;
  switch (fact.kind) {
    case 'affordabilityGoal':
      text = affordabilityGoalText(persona, fact);
      break;
    case 'categorySpend':
      text = categorySpendText(persona, fact);
      break;
    case 'safeToSpend':
      text = safeToSpendText(persona, fact);
      break;
    case 'goalStatus':
      text = goalStatusText(persona, fact);
      break;
    case 'subscriptionSpend':
      text = subscriptionSpendText(persona, fact);
      break;
    case 'unknownGoal':
      text = unknownGoalText(persona, fact);
      break;
    case 'unknownQuery':
      text = unknownQueryText(persona);
      break;
  }

  const isGrounded = fact.kind !== 'unknownGoal' && fact.kind !== 'unknownQuery';
  return {
    text: isGrounded ? withCaveat(persona, fact.confidence, text) : text,
    confidence: fact.confidence,
    sourceTab: fact.sourceTab,
    sourceLabel: fact.sourceLabel,
  };
}
