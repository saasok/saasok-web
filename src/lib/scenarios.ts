import scenariosData from "../../data/scenarios.json";

export type ScenarioTag = "g" | "r" | "n";
export type Horizon = "5" | "10";

export interface ScenarioHorizon {
  txt: string;
  tags: Record<string, ScenarioTag>;
}

export interface Scenario {
  title: string;
  blurb: string;
  y5: ScenarioHorizon;
  y10: ScenarioHorizon;
}

export const SCENARIOS: Scenario[] = (
  scenariosData as unknown as { scenarios: Scenario[] }
).scenarios;

export function getScenarioTag(
  scenario: Scenario,
  horizon: Horizon,
  symbol: string,
): ScenarioTag | null {
  const detail = horizon === "5" ? scenario.y5 : scenario.y10;
  return detail.tags[symbol] ?? null;
}

export function getScenarioHorizon(
  scenario: Scenario,
  horizon: Horizon,
): ScenarioHorizon {
  return horizon === "5" ? scenario.y5 : scenario.y10;
}
