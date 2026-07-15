import { correlationScore, getTopCorrelated } from "./correlation";
import { COMPETITIVE_ASSETS } from "./competitiveAssets";

const TICKERS = COMPETITIVE_ASSETS.map((a) => a.ticker);

describe("correlationScore", () => {
  it("is deterministic: repeated calls with the same pair return the same score", () => {
    const a = correlationScore("NVDA", "AVGO");
    const b = correlationScore("NVDA", "AVGO");
    expect(a).toBe(b);
  });

  it("returns a valid 0-100 percentage for every pair among the 20 assets", () => {
    for (const a of TICKERS) {
      for (const b of TICKERS) {
        if (a === b) continue;
        const score = correlationScore(a, b);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      }
    }
  });

  it("scores same-cluster pairs (e.g. two chip names) higher than an unrelated cross-cluster pair", () => {
    const sameCluster = correlationScore("NVDA", "AVGO"); // both chips
    const unrelated = correlationScore("BLK", "BYDDY"); // assetmgmt vs ev, not in CROSS table
    expect(sameCluster).toBeGreaterThan(unrelated);
  });
});

describe("getTopCorrelated", () => {
  it("excludes the selected asset from its own results", () => {
    const results = getTopCorrelated("NVDA");
    expect(results.some((r) => r.ticker === "NVDA")).toBe(false);
  });

  it("defaults to ranking all 19 other assets", () => {
    const results = getTopCorrelated("NVDA");
    expect(results).toHaveLength(TICKERS.length - 1);
  });

  it("respects a custom n and sorts descending by score", () => {
    const results = getTopCorrelated("NVDA", 5);
    expect(results).toHaveLength(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("clamps n above the number of available peers", () => {
    const results = getTopCorrelated("NVDA", 999);
    expect(results).toHaveLength(TICKERS.length - 1);
  });

  it("is deterministic across repeated calls", () => {
    const first = getTopCorrelated("TSLA");
    const second = getTopCorrelated("TSLA");
    expect(second).toEqual(first);
  });
});
