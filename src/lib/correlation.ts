import pelosiData from "../../data/pelosi-trades.json";
import warshData from "../../data/warsh-speeches.json";
import marketNewsData from "../../data/market-news.json";
import exchangesData from "../../data/exchanges.json";

// Correlation score = a cluster/fundamental "proximity" base (see
// docs/mockup.html's correlationPct, ported below) plus a small, bounded
// "qualitative signal" bonus assembled from the demo's four narrative data
// sources (calendar/exchanges, Pelosi trades, Warsh speeches, market news).
// This is a deliberately simplified heuristic for a product demo, NOT a
// real quantitative-finance correlation model — every bonus below is a
// flat, hand-picked nudge documented at its source, not a statistically
// estimated weight.

export type AssetCluster =
  | "megacap"
  | "assetmgmt"
  | "consumer"
  | "chips"
  | "ev"
  | "crypto"
  | "payments"
  | "cyber"
  | "defense";

// No data/*.json file (nor either source .xlsx) carries a sector/cluster
// column for these 20 assets — this taxonomy only exists as a hardcoded
// ASSETS20 array in docs/mockup.html. Ported verbatim from there.
const CLUSTER_BY_TICKER: Record<string, AssetCluster> = {
  GOOGL: "megacap",
  AMZN: "megacap",
  AAPL: "megacap",
  BLK: "assetmgmt",
  BKNG: "consumer",
  AVGO: "chips",
  BYDDY: "ev",
  COIN: "crypto",
  MA: "payments",
  MSFT: "megacap",
  NFLX: "consumer",
  NVDA: "chips",
  PANW: "cyber",
  PLTR: "defense",
  RDDT: "consumer",
  RTX: "defense",
  MSTR: "crypto",
  TSM: "chips",
  TSLA: "ev",
  V: "payments",
};

const ALL_TICKERS = Object.keys(CLUSTER_BY_TICKER);

// ---------------------------------------------------------------------
// Fundamental / sector-proximity sub-score (ported from docs/mockup.html's
// CROSS table + correlationPct, minus the tk===tk shortcut since callers
// exclude the selected ticker from its own results upstream).
// ---------------------------------------------------------------------

const SAME_CLUSTER_BASE = 75;
const DEFAULT_CROSS_CLUSTER_BASE = 12;
const FUNDAMENTAL_MIN = 3;
const FUNDAMENTAL_MAX = 95;

const CROSS: Record<string, number> = {
  "megacap|chips": 62,
  "chips|megacap": 62,
  "crypto|ev": 50,
  "ev|crypto": 50,
  "megacap|payments": 35,
  "payments|megacap": 35,
  "chips|defense": 25,
  "defense|chips": 25,
  "chips|cyber": 28,
  "cyber|chips": 28,
  "megacap|consumer": 32,
  "consumer|megacap": 32,
  "assetmgmt|payments": 28,
  "payments|assetmgmt": 28,
  "defense|megacap": 15,
  "megacap|defense": 15,
};

// Deterministic per-pair jitter in [-8, 8] so same-cluster/default-cluster
// pairs aren't all flatly identical, without any randomness.
function hashPair(a: string, b: string): number {
  const s = a + b;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 1000;
  }
  return h;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fundamentalScore(tickerA: string, tickerB: string): number {
  const clusterA = CLUSTER_BY_TICKER[tickerA];
  const clusterB = CLUSTER_BY_TICKER[tickerB];
  const base =
    clusterA === clusterB
      ? SAME_CLUSTER_BASE
      : (CROSS[`${clusterA}|${clusterB}`] ?? DEFAULT_CROSS_CLUSTER_BASE);
  const jitter = (hashPair(tickerA, tickerB) % 17) - 8;
  return clamp(base + jitter, FUNDAMENTAL_MIN, FUNDAMENTAL_MAX);
}

// ---------------------------------------------------------------------
// Qualitative signal bonus — four independently-documented heuristics, one
// per narrative data source, each computed once from the static JSON (no
// Date.now()/wall-clock anywhere: determinism is a hard requirement here).
// ---------------------------------------------------------------------

export const PELOSI_COOCCURRENCE_BONUS = 4;
export const URGENT_MACRO_BONUS = 6;
export const NEWS_THEME_BONUS = 3;
export const MARKET_STRESS_BONUS = 2;

// Heuristic 1 (Pelosi trades): both tickers appear among the 10 most
// recent congressional trades — a loose "both are currently 'hot' /
// politically-visible names at the same time" attention-correlation proxy.
interface PelosiTrade {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  amountRange: string;
}
const pelosiTrades = (pelosiData as unknown as { trades: PelosiTrade[] }).trades;
const PELOSI_HOT_TICKERS = new Set(
  [...pelosiTrades]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .map((t) => t.ticker),
);

// Heuristic 2 (Warsh speeches): the demo's "urgent macro window" flag.
// HAS_URGENT_MACRO_WINDOW is always true against the current fixture (the
// dataset always contains FOMC entries) — it exists as a structural hook
// so this reads as data-driven rather than hardcoding the bonus directly,
// not as live conditional logic against a real calendar. When it's on,
// clusters mockup.html's own "Scenario Studio" (page 9) already tags as
// geopolitically sensitive under a US-China escalation scenario move
// slightly closer together.
interface WarshTalk {
  date: string;
  topic: string;
  location: string;
}
const warshTalks = (warshData as unknown as { talks: WarshTalk[] }).talks;
const HAS_URGENT_MACRO_WINDOW = warshTalks.some((t) =>
  t.topic.includes("FOMC"),
);
const SENSITIVE_CLUSTERS: AssetCluster[] = ["chips", "defense", "cyber", "ev"];

// Heuristic 3 (market news): both tickers' clusters have a live narrative
// thread in the news feed right now (keyword-matched against real
// title/description text — headlines are anonymized, so this can only
// match by theme, not by company name).
const NEWS_THEME_KEYWORDS: Partial<Record<AssetCluster, string[]>> = {
  megacap: ["hyperscaler", "mega-cap", "cloud provider", "ai capex"],
  chips: ["chip", "semiconductor", "foundry"],
  ev: ["electric-vehicle", "electric vehicle", "autonomous-driving"],
  defense: ["defense", "nato", "munitions"],
  payments: ["payments network", "cross-border"],
  crypto: ["crypto", "digital-asset", "digital asset"],
  cyber: ["cybersecurity", "breach"],
  consumer: ["travel platform", "airlines", "booking momentum"],
};
interface NewsItem {
  title: string;
  source: string;
  date: string;
  description: string;
}
const newsItems = (marketNewsData as unknown as { items: NewsItem[] }).items;
const NEWS_TEXT = newsItems
  .map((item) => `${item.title} ${item.description}`.toLowerCase())
  .join(" \n ");
const NEWS_THEMED_CLUSTERS = new Set(
  (Object.keys(NEWS_THEME_KEYWORDS) as AssetCluster[]).filter((cluster) =>
    NEWS_THEME_KEYWORDS[cluster]!.some((kw) => NEWS_TEXT.includes(kw)),
  ),
);

// Heuristic 4 (exchange calendar): a simplified nod to the real phenomenon
// that correlations tend to rise during market-stress regimes. If any
// exchange is currently flagging a disruption, every pair gets a small
// flat bump. MARKET_STRESS_ACTIVE is always true against the current
// fixture (NYSE and HKEX both carry real urgentNote values) — again, a
// structural hook rather than a live "is today disrupted" check.
interface Exchange {
  name: string;
  urgentNote: string;
}
const exchanges = (exchangesData as unknown as { exchanges: Exchange[] })
  .exchanges;
const MARKET_STRESS_ACTIVE = exchanges.some((e) => e.urgentNote !== "—");

function qualitativeBonus(tickerA: string, tickerB: string): number {
  let bonus = 0;

  if (PELOSI_HOT_TICKERS.has(tickerA) && PELOSI_HOT_TICKERS.has(tickerB)) {
    bonus += PELOSI_COOCCURRENCE_BONUS;
  }

  if (HAS_URGENT_MACRO_WINDOW) {
    const clusterA = CLUSTER_BY_TICKER[tickerA];
    const clusterB = CLUSTER_BY_TICKER[tickerB];
    if (
      SENSITIVE_CLUSTERS.includes(clusterA) &&
      SENSITIVE_CLUSTERS.includes(clusterB)
    ) {
      bonus += URGENT_MACRO_BONUS;
    }
  }

  const clusterA = CLUSTER_BY_TICKER[tickerA];
  const clusterB = CLUSTER_BY_TICKER[tickerB];
  if (NEWS_THEMED_CLUSTERS.has(clusterA) && NEWS_THEMED_CLUSTERS.has(clusterB)) {
    bonus += NEWS_THEME_BONUS;
  }

  if (MARKET_STRESS_ACTIVE) {
    bonus += MARKET_STRESS_BONUS;
  }

  return bonus;
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

export function correlationScore(tickerA: string, tickerB: string): number {
  const total = fundamentalScore(tickerA, tickerB) + qualitativeBonus(tickerA, tickerB);
  return Math.round(clamp(total, 0, 100));
}

export interface CorrelationResult {
  ticker: string;
  score: number;
}

// Excludes `ticker` from its own results, sorted descending by score.
// Defaults to n=19 (all other assets) since the correlation view's layout
// needs every non-center asset ranked and positioned, not just a subset;
// callers wanting a literal "top N" can pass a smaller n.
export function getTopCorrelated(
  ticker: string,
  n: number = ALL_TICKERS.length - 1,
): CorrelationResult[] {
  const others = ALL_TICKERS.filter((t) => t !== ticker);
  const scored = others
    .map((t) => ({ ticker: t, score: correlationScore(ticker, t) }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.min(n, scored.length));
}
