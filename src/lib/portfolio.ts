import { BROKERS, type Risk } from "@/store/onboarding";
import portfoliosData from "../../data/portfolios.json";
import taxInsightsData from "../../data/tax-insights.json";

export type Broker = (typeof BROKERS)[number];
export type RiskLevel = Risk;

export const RISK_LEVELS: RiskLevel[] = ["conservative", "moderate", "aggressive"];

// Short names as used by the Broker Fees sheet and for on-screen labels;
// "INTERACTIVE BROKERS (IBKR)" is the raw source-sheet name used everywhere
// else (see BROKERS in @/store/onboarding).
const BROKER_SHORT_NAME: Record<Broker, string> = {
  "INTERACTIVE BROKERS (IBKR)": "IBKR",
  SAXO: "Saxo",
  WIO: "Wio",
  XTB: "XTB",
  SWISSQUOTE: "Swissquote",
  EXANTE: "Exante",
};

const RISK_PROFILE_NAME: Record<RiskLevel, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

// Symbols seeded with a synthetic unrealized loss so every broker/risk
// combination carries real underwater positions for the session-6 tax-loss
// feature. Each symbol is present in every broker's sheet for its risk
// level (see docs/mockup.html buildDashboard / buildTaxBlocks), so the
// guarantee survives any 1-3 broker merge.
const SEEDED_LOSS_PCT: Record<string, number> = {
  TLT: 0.08,
  LQD: 0.05,
  TSM: 0.12,
  XAUUSD: 0.04,
  AVGO: 0.15,
  COIN: 0.3,
  PLTR: 0.18,
  RDDT: 0.22,
};

// Mirrors STOCK_SECTOR / getSector in docs/mockup.html so the pie card
// groups positions the same way the mockup does.
const STOCK_SECTOR: Record<string, string> = {
  NVDA: "Technology",
  MSFT: "Technology",
  AAPL: "Technology",
  AVGO: "Technology",
  TSM: "Technology",
  PANW: "Technology",
  PLTR: "Technology",
  GOOGL: "Communication Svcs",
  RDDT: "Communication Svcs",
  META: "Communication Svcs",
  AMZN: "Consumer Discretionary",
  TSLA: "Consumer Discretionary",
  BYDDY: "Consumer Discretionary",
  BKNG: "Consumer Discretionary",
  MA: "Financials",
  V: "Financials",
  BLK: "Financials",
  COIN: "Financials",
  MSTR: "Financials",
};

export interface Position {
  symbol: string;
  type: string;
  value: number;
  costBasis: number;
  unrealizedGainLoss: number;
  underwater: boolean;
}

export interface Portfolio {
  brokerLabel: string;
  total: number;
  positions: Position[];
}

export interface SectorSlice {
  sector: string;
  value: number;
  pct: number;
}

export interface BrokerFees {
  broker: string;
  stockEtfCommission: string;
  custodyFeeAnnual: number;
  custodyFeeNotes: string;
  // Wio's sheet leaves this as the string "Not disclosed" instead of a rate.
  fxConversionFee: number | string;
  inactivityFee: string;
  minDepositApproxUsdEquiv: number;
  sourceLastChecked: string;
  ukIsaOffered: string;
}

export interface FeeSummary {
  fees: BrokerFees[];
  custodyFeeAnnualUsd: number;
  // null when any selected broker doesn't publish a numeric FX rate.
  fxConversionFeeUsd: number | null;
}

interface RawHolding {
  symbol: string;
  type: string;
  value: number;
}

interface RawProfile {
  name: string;
  totalPortfolioValue: number | null;
  holdings: RawHolding[];
}

interface RawBroker {
  broker: string;
  profiles: RawProfile[];
}

const brokersData = (portfoliosData as unknown as { brokers: RawBroker[] }).brokers;
const brokerFeeRows = (
  taxInsightsData as unknown as { brokerFees: { rows: BrokerFees[] } }
).brokerFees.rows;

function findProfile(broker: Broker, risk: RiskLevel): RawProfile {
  const brokerEntry = brokersData.find((b) => b.broker === broker);
  if (!brokerEntry) throw new Error(`Unknown broker: ${broker}`);

  const profileName = RISK_PROFILE_NAME[risk];
  const profile = brokerEntry.profiles.find((p) => p.name === profileName);
  if (!profile) throw new Error(`No ${risk} profile for broker ${broker}`);

  return profile;
}

function withLossData(
  symbol: string,
  value: number
): Pick<Position, "costBasis" | "unrealizedGainLoss" | "underwater"> {
  const lossPct = SEEDED_LOSS_PCT[symbol];
  const costBasis = lossPct ? value / (1 - lossPct) : value;
  return {
    costBasis,
    unrealizedGainLoss: value - costBasis,
    underwater: costBasis > value,
  };
}

export function getPortfolio(brokers: Broker[], risk: RiskLevel): Portfolio {
  if (brokers.length === 0) {
    throw new Error("getPortfolio requires at least one broker");
  }
  if (brokers.length > 3) {
    throw new Error("getPortfolio supports at most 3 brokers");
  }

  const merged = new Map<string, { symbol: string; type: string; value: number }>();
  brokers.forEach((broker) => {
    const profile = findProfile(broker, risk);
    profile.holdings.forEach((holding) => {
      const existing = merged.get(holding.symbol);
      if (existing) {
        existing.value += holding.value;
      } else {
        merged.set(holding.symbol, { ...holding });
      }
    });
  });

  const positions: Position[] = Array.from(merged.values())
    .sort((a, b) => b.value - a.value)
    .map((p) => ({ ...p, ...withLossData(p.symbol, p.value) }));

  const total = positions.reduce((sum, p) => sum + p.value, 0);

  const brokerLabel =
    brokers.length > 1
      ? `Consolidated: ${brokers.map((b) => BROKER_SHORT_NAME[b]).join(" + ")}`
      : BROKER_SHORT_NAME[brokers[0]];

  return { brokerLabel, total, positions };
}

function getSector(symbol: string, type: string): string {
  if (type === "USD") return "Cash";
  if (/Bond|Treasury/i.test(type)) return "Fixed Income";
  if (symbol === "SPY" || symbol === "QQQ" || symbol === "MSCI World") {
    return "Broad Equity ETF";
  }
  if (/FX/i.test(type)) return "Commodities & FX";
  if (type === "Futures") return "Equity Index Futures";
  if (type === "Options") {
    const underlying = symbol.split(" ")[0].replace(".", "");
    return STOCK_SECTOR[underlying] || "Derivatives";
  }
  if (type === "Stock") return STOCK_SECTOR[symbol] || "Other Equity";
  return "Other";
}

export function getSectorBreakdown(positions: Position[]): SectorSlice[] {
  const total = positions.reduce((sum, p) => sum + p.value, 0);
  const byType = new Map<string, number>();
  positions.forEach((p) => {
    const sector = getSector(p.symbol, p.type);
    byType.set(sector, (byType.get(sector) ?? 0) + p.value);
  });

  return Array.from(byType.entries()).map(([sector, value]) => ({
    sector,
    value,
    pct: total > 0 ? value / total : 0,
  }));
}

export function getBrokerFees(broker: Broker): BrokerFees {
  const shortName = BROKER_SHORT_NAME[broker];
  const row = brokerFeeRows.find((r) => r.broker === shortName);
  if (!row) throw new Error(`No fee data for broker: ${broker}`);
  return row;
}

// Averages published rates across the selected brokers and applies them to
// the merged portfolio total. Commission is left as raw per-broker text
// (BrokerFees.stockEtfCommission) rather than a dollar figure: the sheet
// only gives per-share/per-trade rates, which aren't computable into a
// dollar cost without trade-level data.
export function summarizeFees(brokers: Broker[], total: number): FeeSummary {
  const fees = brokers.map((broker) => getBrokerFees(broker));

  const custodyPct =
    fees.reduce((sum, f) => sum + f.custodyFeeAnnual, 0) / fees.length;

  const fxRates = fees
    .map((f) => f.fxConversionFee)
    .filter((f): f is number => typeof f === "number");
  const fxConversionFeeUsd =
    fxRates.length === fees.length
      ? (total * (fxRates.reduce((sum, r) => sum + r, 0) / fxRates.length)) / 100
      : null;

  return {
    fees,
    custodyFeeAnnualUsd: (total * custodyPct) / 100,
    fxConversionFeeUsd,
  };
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

export function getAllBrokerCombinations(): Broker[][] {
  return [1, 2, 3].flatMap((size) => combinations([...BROKERS], size));
}
