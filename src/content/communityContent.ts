// Static community-facing content. Deliberately NOT part of src/engine —
// this is anonymized, aggregate population data (or illustrative feed
// copy), not something derivable from any one user's EngineInput. In a real
// backend this would come from an aggregation service; here it's mocked.

export interface CommunityBenchmark {
  categoryLabel: string;
  peerAveragePctOfIncome: number; // 0..1
  peerGroupLabel: string;
}

export const FOOD_SPEND_BENCHMARK: CommunityBenchmark = {
  categoryLabel: 'Food',
  peerAveragePctOfIncome: 0.22,
  peerGroupLabel: '25-30 saal, metro',
};

export interface CommunityWin {
  id: string;
  icon: string;
  text: string;
}

export const COMMUNITY_WINS: CommunityWin[] = [
  { id: 'win-1', icon: '🎯', text: 'Ek user ne 4 mahine mein emergency fund pura kiya 🎉' },
  { id: 'win-2', icon: '✂️', text: 'Someone cut 2 subscriptions — ₹448/mo bacha liya' },
];
