"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { COMPETITIVE_ASSETS } from "@/lib/competitiveAssets";
import { getTopCorrelated } from "@/lib/correlation";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";

const STAGE_HEIGHT = 430;
const COLUMN_INSET = 24;

const LEFT_TICKERS = COMPETITIVE_ASSETS.slice(0, 10).map((a) => a.ticker);
const RIGHT_TICKERS = COMPETITIVE_ASSETS.slice(10, 20).map((a) => a.ticker);
const NAME_BY_TICKER = Object.fromEntries(
  COMPETITIVE_ASSETS.map((a) => [a.ticker, a.name]),
);

interface NodePosition {
  ticker: string;
  side: "left" | "right";
  top: number;
  score?: number;
}

// Reorders a rank-sorted list (best first) so the best-ranked item lands at
// the middle array index and subsequent ranks alternate outward above/below
// it. Combined with layoutColumn's even top-to-bottom spacing, this makes
// higher-correlated assets visually cluster nearest the center frame's
// vertical midpoint while lower-ranked ones taper toward the column edges.
function centerOutOrder(ranked: string[]): string[] {
  const result: string[] = new Array(ranked.length);
  const mid = Math.floor((ranked.length - 1) / 2);
  let up = mid;
  let down = mid + 1;
  ranked.forEach((ticker, i) => {
    if (i % 2 === 0) {
      result[up] = ticker;
      up--;
    } else {
      result[down] = ticker;
      down++;
    }
  });
  return result;
}

// Evenly spaces a ranked list of tickers top-to-bottom within the stage.
// Used identically for the default (sequential) order and the post-selection
// (center-out) order, so no separate slot-table/reset logic is needed.
function layoutColumn(
  orderedTickers: string[],
  side: "left" | "right",
  scores?: Map<string, number>,
): NodePosition[] {
  return orderedTickers.map((ticker, i) => ({
    ticker,
    side,
    top: ((i + 1) / (orderedTickers.length + 1)) * STAGE_HEIGHT,
    score: scores?.get(ticker),
  }));
}

export function CorrelationAnalysisPage({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const t = useTranslations("correlation");
  const tc = useTranslations("common");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  let nodes: NodePosition[];
  if (selectedTicker === null) {
    nodes = [
      ...layoutColumn(LEFT_TICKERS, "left"),
      ...layoutColumn(RIGHT_TICKERS, "right"),
    ];
  } else {
    // Ranked all 19 others (not a subset) because every non-center asset
    // needs a slot in one of the two columns.
    const ranked = getTopCorrelated(selectedTicker);
    const scores = new Map(ranked.map((r) => [r.ticker, r.score]));
    const left: string[] = [];
    const right: string[] = [];
    ranked.forEach((r, i) => (i % 2 === 0 ? left : right).push(r.ticker));
    // A ticker's side can differ from its default column between different
    // selections since assignment is rank-driven, not identity-driven —
    // expected, not a bug.
    nodes = [
      ...layoutColumn(centerOutOrder(left), "left", scores),
      ...layoutColumn(centerOutOrder(right), "right", scores),
    ];
  }

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

        <div
          className="relative w-full max-w-[960px]"
          style={{ height: STAGE_HEIGHT }}
          data-testid="corr-stage"
        >
          <div
            className="absolute top-1/2 left-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-silver/40 bg-silver/[0.08]"
            data-testid="corr-frame"
          />

          {selectedTicker !== null && (
            <button
              type="button"
              data-testid="corr-reset"
              aria-label={t("resetAria")}
              onClick={() => setSelectedTicker(null)}
              className="absolute left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-black/30 font-sans text-xs font-bold text-red"
              style={{ top: STAGE_HEIGHT / 2 - 115 - 26 }}
            >
              &#10005;
            </button>
          )}

          {selectedTicker !== null && (
            <div
              key={selectedTicker}
              data-testid={`corr-node-${selectedTicker}`}
              data-center="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-amber px-3.5 py-2.5 text-center font-mono text-xs font-bold whitespace-nowrap text-[#1a1400] transition-all duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            >
              {selectedTicker}
            </div>
          )}

          {nodes.map((node) => (
            <button
              type="button"
              key={node.ticker}
              data-testid={`corr-node-${node.ticker}`}
              data-center="false"
              data-side={node.side}
              onClick={() => setSelectedTicker(node.ticker)}
              title={NAME_BY_TICKER[node.ticker]}
              className="absolute -translate-y-1/2 rounded-md bg-silver px-2.5 py-[7px] text-center font-mono text-[10.5px] font-semibold whitespace-nowrap text-[#151515] transition-all duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:bg-silver-hi"
              style={{
                top: node.top,
                ...(node.side === "left"
                  ? { left: COLUMN_INSET }
                  : { right: COLUMN_INSET }),
              }}
            >
              {node.ticker}
              {node.score !== undefined && (
                <span
                  data-testid={`corr-pct-${node.ticker}`}
                  className="mt-0.5 block font-sans text-[9px] font-normal text-muted-dim"
                >
                  {node.score}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Disclaimer />

      <button
        type="button"
        aria-label={tc("previousPageAria")}
        data-testid="corr-prev-arrow"
        onClick={onPrev}
        className="absolute top-1/2 left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8249;
      </button>
      <button
        type="button"
        aria-label={tc("nextPageAria")}
        data-testid="corr-next-arrow"
        onClick={onNext}
        className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8250;
      </button>
    </div>
  );
}
