import { BROKERS } from "@/store/onboarding";
import portfoliosData from "../../data/portfolios.json";
import {
  RISK_LEVELS,
  getAllBrokerCombinations,
  getBrokerFees,
  getPortfolio,
  getSectorBreakdown,
  type Broker,
} from "./portfolio";

describe("getPortfolio: single broker", () => {
  it("returns that broker's own positions and total", () => {
    const result = getPortfolio(["INTERACTIVE BROKERS (IBKR)"], "conservative");
    expect(result.brokerLabel).toBe("IBKR");
    expect(result.total).toBeCloseTo(599750.27, 2);
    expect(result.positions.map((p) => p.symbol).sort()).toEqual(
      ["TLT", "LQD", "SPY", "QQQ", "Cash"].sort()
    );
  });

  it("sorts positions by value descending", () => {
    const result = getPortfolio(["SAXO"], "moderate");
    const values = result.positions.map((p) => p.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it("throws for an empty or oversized broker list", () => {
    expect(() => getPortfolio([], "conservative")).toThrow();
    expect(() =>
      getPortfolio(Array(4).fill("SAXO") as Broker[], "conservative")
    ).toThrow();
  });
});

describe("getPortfolio: multi-broker merge", () => {
  it("merges 2 brokers and sums duplicate symbols instead of overwriting", () => {
    const ibkr = getPortfolio(["INTERACTIVE BROKERS (IBKR)"], "conservative");
    const saxo = getPortfolio(["SAXO"], "conservative");
    const merged = getPortfolio(
      ["INTERACTIVE BROKERS (IBKR)", "SAXO"],
      "conservative"
    );

    expect(merged.brokerLabel).toBe("Consolidated: IBKR + Saxo");
    expect(merged.total).toBeCloseTo(ibkr.total + saxo.total, 2);

    const tltIbkr = ibkr.positions.find((p) => p.symbol === "TLT")!.value;
    const tltSaxo = saxo.positions.find((p) => p.symbol === "TLT")!.value;
    const tltMerged = merged.positions.find((p) => p.symbol === "TLT")!.value;
    expect(tltMerged).toBeCloseTo(tltIbkr + tltSaxo, 2);
    expect(tltMerged).not.toBeCloseTo(tltIbkr, 2);
    expect(tltMerged).not.toBeCloseTo(tltSaxo, 2);

    // no duplicate symbol rows after merge
    const symbols = merged.positions.map((p) => p.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("merges 3 brokers and sums duplicate symbols across all three", () => {
    const brokers: (typeof BROKERS)[number][] = [
      "INTERACTIVE BROKERS (IBKR)",
      "SAXO",
      "WIO",
    ];
    const [a, b, c] = brokers.map((broker) =>
      getPortfolio([broker], "aggressive")
    );
    const merged = getPortfolio(brokers, "aggressive");

    expect(merged.brokerLabel).toBe("Consolidated: IBKR + Saxo + Wio");
    expect(merged.total).toBeCloseTo(a.total + b.total + c.total, 2);

    const nvdaTotal =
      a.positions.find((p) => p.symbol === "NVDA")!.value +
      b.positions.find((p) => p.symbol === "NVDA")!.value +
      c.positions.find((p) => p.symbol === "NVDA")!.value;
    expect(
      merged.positions.find((p) => p.symbol === "NVDA")!.value
    ).toBeCloseTo(nvdaTotal, 2);
  });
});

describe("getPortfolio: risk categories", () => {
  it.each(RISK_LEVELS)("resolves a single-broker portfolio for %s", (risk) => {
    const result = getPortfolio(["XTB"], risk);
    expect(result.positions.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });
});

describe("getSectorBreakdown", () => {
  it("groups merged positions by sector and sums to the portfolio total", () => {
    const portfolio = getPortfolio(["SWISSQUOTE"], "moderate");
    const slices = getSectorBreakdown(portfolio.positions);
    const sliceTotal = slices.reduce((sum, s) => sum + s.value, 0);
    expect(sliceTotal).toBeCloseTo(portfolio.total, 2);

    const cash = slices.find((s) => s.sector === "Cash");
    expect(cash?.value).toBeCloseTo(
      portfolio.positions.find((p) => p.symbol === "Cash")!.value,
      2
    );
  });

  it("buckets an options position by its underlying's sector", () => {
    const portfolio = getPortfolio(["INTERACTIVE BROKERS (IBKR)"], "aggressive");
    const slices = getSectorBreakdown(portfolio.positions);
    // NVDA 200 Call -> underlying NVDA -> Technology
    const tech = slices.find((s) => s.sector === "Technology");
    expect(tech).toBeDefined();
  });
});

describe("getBrokerFees", () => {
  it("looks up fee data per broker from the Broker Fees sheet", () => {
    expect(getBrokerFees("INTERACTIVE BROKERS (IBKR)").broker).toBe("IBKR");
    expect(getBrokerFees("SWISSQUOTE").broker).toBe("Swissquote");
    expect(getBrokerFees("WIO").broker).toBe("Wio");
  });

  it("returns numeric fee fields", () => {
    const fees = getBrokerFees("XTB");
    expect(typeof fees.fxConversionFee).toBe("number");
    expect(typeof fees.custodyFeeAnnual).toBe("number");
  });
});

describe("data integrity: all broker combinations", () => {
  const combinations = getAllBrokerCombinations();

  it("has exactly 41 broker combinations (C(6,1)+C(6,2)+C(6,3))", () => {
    expect(combinations).toHaveLength(41);
    const asStrings = new Set(combinations.map((c) => [...c].sort().join("|")));
    expect(asStrings.size).toBe(41);
  });

  it("has exactly 18 broker/risk profile entries in portfolios.json (6 brokers x 3 risk levels)", () => {
    const brokers = (portfoliosData as { brokers: { profiles: unknown[] }[] })
      .brokers;
    expect(brokers).toHaveLength(6);
    const totalProfiles = brokers.reduce((n, b) => n + b.profiles.length, 0);
    expect(totalProfiles).toBe(18);
  });

  it("resolves all 41 combinations x 3 risk levels (123 entries) without a missing combination", () => {
    const failures: string[] = [];
    let count = 0;

    for (const combo of combinations) {
      for (const risk of RISK_LEVELS) {
        count++;
        try {
          const portfolio = getPortfolio(combo, risk);
          if (portfolio.positions.length === 0 || portfolio.total <= 0) {
            failures.push(`${combo.join("+")} / ${risk}: empty portfolio`);
          }
        } catch (err) {
          failures.push(`${combo.join("+")} / ${risk}: ${(err as Error).message}`);
        }
      }
    }

    expect(count).toBe(123);
    expect(failures).toEqual([]);
  });

  it("seeds at least 2 underwater positions in every combination x risk entry", () => {
    const failures: string[] = [];

    for (const combo of combinations) {
      for (const risk of RISK_LEVELS) {
        const portfolio = getPortfolio(combo, risk);
        const underwaterCount = portfolio.positions.filter(
          (p) => p.underwater
        ).length;
        if (underwaterCount < 2) {
          failures.push(
            `${combo.join("+")} / ${risk}: only ${underwaterCount} underwater positions`
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
