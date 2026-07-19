import { SCENARIOS, getScenarioTag, getScenarioHorizon } from "./scenarios";

describe("SCENARIOS", () => {
  it("has exactly 10 scenarios", () => {
    expect(SCENARIOS).toHaveLength(10);
  });

  it("gives every scenario a title, blurb, and non-empty 5yr/10yr copy", () => {
    SCENARIOS.forEach((scenario) => {
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.blurb.length).toBeGreaterThan(0);
      expect(scenario.y5.txt.length).toBeGreaterThan(0);
      expect(scenario.y10.txt.length).toBeGreaterThan(0);
    });
  });

  it("only uses green/red/neutral tag values", () => {
    SCENARIOS.forEach((scenario) => {
      [scenario.y5.tags, scenario.y10.tags].forEach((tags) => {
        Object.values(tags).forEach((tag) => {
          expect(["g", "r", "n"]).toContain(tag);
        });
      });
    });
  });
});

describe("getScenarioTag", () => {
  const supercycle = SCENARIOS[0];

  it("returns the tag for a known symbol at the given horizon", () => {
    expect(getScenarioTag(supercycle, "5", "AAPL")).toBe("g");
    expect(getScenarioTag(supercycle, "5", "RTX")).toBe("n");
    expect(getScenarioTag(supercycle, "10", "NVDA")).toBe("g");
  });

  it("returns null for a symbol absent from that horizon's tag map", () => {
    expect(getScenarioTag(supercycle, "10", "RTX")).toBeNull();
  });

  it("differs between horizons for the same scenario", () => {
    const stagflation = SCENARIOS[2];
    expect(getScenarioTag(stagflation, "5", "TSLA")).toBe("r");
    expect(getScenarioTag(stagflation, "10", "TSLA")).toBeNull();
  });
});

describe("getScenarioHorizon", () => {
  it("selects the y5 block for horizon '5' and y10 for '10'", () => {
    const scenario = SCENARIOS[0];
    expect(getScenarioHorizon(scenario, "5")).toBe(scenario.y5);
    expect(getScenarioHorizon(scenario, "10")).toBe(scenario.y10);
  });
});
