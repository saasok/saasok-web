"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOnboardingStore } from "@/store/onboarding";
import { getPortfolio, type Broker } from "@/lib/portfolio";
import { formatCurrency } from "@/lib/formatCurrency";
import { trackEvent } from "@/lib/analytics";
import {
  SCENARIOS,
  getScenarioTag,
  getScenarioHorizon,
  type Horizon,
} from "@/lib/scenarios";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";

const HORIZONS: Horizon[] = ["5", "10"];

type Highlight = "green" | "red" | "gray" | "none";

const HIGHLIGHT_CLASS: Record<Highlight, string> = {
  green: "text-green",
  red: "text-red",
  gray: "text-muted",
  none: "text-ivory",
};

function highlightFor(
  selectedIndex: number | null,
  horizon: Horizon,
  symbol: string,
): Highlight {
  if (selectedIndex === null) return "none";
  const tag = getScenarioTag(SCENARIOS[selectedIndex], horizon, symbol);
  if (tag === "g") return "green";
  if (tag === "r") return "red";
  return "gray";
}

export function ScenarioStudioPage({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const t = useTranslations("scenarioStudio");
  const tc = useTranslations("common");
  const brokers = useOnboardingStore((s) => s.brokers) as Broker[];
  const risk = useOnboardingStore((s) => s.risk);
  const language = useOnboardingStore((s) => s.language);
  const [horizon, setHorizon] = useState<Horizon>("5");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (brokers.length === 0 || !risk) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-10 py-9">
        <TopBrand />
        <div className="max-w-xl text-center font-fraunces text-xl font-semibold text-ivory">
          {t("incomplete")}
        </div>
        <Disclaimer />
      </div>
    );
  }

  const portfolio = getPortfolio(brokers, risk);
  const selected = selectedIndex !== null ? SCENARIOS[selectedIndex] : null;
  const detail = selected ? getScenarioHorizon(selected, horizon) : null;

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bottom-16 flex flex-col items-center overflow-y-auto px-10 pt-[58px] pb-9">
        <TopBrand />
        <div className="mb-1 font-mono text-[10px] tracking-[0.12em] text-amber-dim uppercase">
          {t("pageLabel")}
        </div>
        <div className="mb-3.5 font-fraunces text-[17px] font-semibold text-ivory">
          {t("title")}
        </div>

        <div className="flex w-full max-w-[1020px] flex-wrap items-start justify-center gap-4">
          <div className="flex max-h-[420px] w-[230px] flex-col gap-2 overflow-y-auto">
            <div className="mb-1 flex gap-1.5" data-testid="scen-horizon-tabs">
              {HORIZONS.map((h) => (
                <button
                  type="button"
                  key={h}
                  data-testid={`scen-horizon-${h}`}
                  data-active={horizon === h}
                  onClick={() => setHorizon(h)}
                  className={`flex-1 rounded-md py-1.5 text-center font-mono text-[11px] ${
                    horizon === h
                      ? "bg-amber font-bold text-[#1a1400]"
                      : "bg-white/[0.06] text-ivory"
                  }`}
                >
                  {t("yearsTab", { n: h })}
                </button>
              ))}
            </div>

            {SCENARIOS.map((scenario, i) => (
              <button
                type="button"
                key={scenario.title}
                data-testid={`scen-card-${i}`}
                data-active={selectedIndex === i}
                onClick={() => {
                  setSelectedIndex(i);
                  trackEvent("scenario_click", {
                    scenario: scenario.title,
                    horizon,
                    index: i,
                  });
                }}
                className={`rounded-[9px] border p-2.5 text-left text-[11px] transition ${
                  selectedIndex === i
                    ? "border-amber bg-amber/10"
                    : "border-panel-border bg-panel hover:border-amber-dim"
                }`}
              >
                <b className="mb-0.5 block font-fraunces text-[11.5px] text-ivory">
                  {i + 1}. {scenario.title}
                </b>
                <span className="text-[9.5px] text-muted-dim">
                  {scenario.blurb}
                </span>
              </button>
            ))}
          </div>

          <div className="flex w-[340px] flex-col items-center gap-3">
            <div className="w-full rounded-2xl border border-panel-border bg-panel p-5">
              <h3 className="mb-0.5 font-fraunces text-sm font-semibold text-ivory">
                {portfolio.brokerLabel}
              </h3>
              <div
                className="mb-3 font-mono text-2xl font-semibold text-amber"
                data-testid="scen-total"
              >
                {formatCurrency(portfolio.total, language)}
              </div>
              <div
                className="max-h-[380px] overflow-y-auto pr-1"
                data-testid="scen-positions"
              >
                {portfolio.positions.map((p) => {
                  const highlight = highlightFor(
                    selectedIndex,
                    horizon,
                    p.symbol,
                  );
                  return (
                    <div
                      key={p.symbol}
                      className="flex justify-between border-b border-white/5 py-1.5 font-mono text-[11px]"
                      data-testid={`scen-position-${p.symbol}`}
                      data-highlight={highlight}
                    >
                      <span
                        className={`font-semibold ${HIGHLIGHT_CLASS[highlight]}`}
                      >
                        {p.symbol}
                      </span>
                      <span className="font-sans text-[10.5px] text-muted-dim">
                        {p.type}
                      </span>
                      <span className="text-ivory">
                        {formatCurrency(p.value, language)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              data-testid="scen-reset"
              onClick={() => setSelectedIndex(null)}
              className="rounded-full border border-panel-border px-4 py-2 font-mono text-[10.5px] text-muted transition hover:border-amber-dim hover:text-ivory"
            >
              {t("reset")}
            </button>
          </div>

          <div
            className="w-[230px] rounded-xl border border-panel-border bg-panel p-4 font-sans text-[11px] leading-relaxed text-muted"
            data-testid="scen-detail"
          >
            {detail && selected ? (
              <>
                <h4
                  className="mb-2 font-fraunces text-[13px] text-ivory"
                  data-testid="scen-detail-title"
                >
                  {t("detailTitle", { title: selected.title, horizon })}
                </h4>
                <p data-testid="scen-detail-text">{detail.txt}</p>
              </>
            ) : (
              <>
                <h4 className="mb-2 font-fraunces text-[13px] text-ivory">
                  {t("pickScenario")}
                </h4>
                <p>{t("pickScenarioHint")}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <Disclaimer />

      <button
        type="button"
        aria-label={tc("previousPageAria")}
        data-testid="scen-prev-arrow"
        onClick={onPrev}
        className="absolute top-1/2 left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8249;
      </button>
      <button
        type="button"
        aria-label={tc("nextPageAria")}
        data-testid="scen-next-arrow"
        onClick={onNext}
        className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8250;
      </button>
    </div>
  );
}
