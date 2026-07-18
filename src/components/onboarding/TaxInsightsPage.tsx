"use client";

import { useState } from "react";
import {
  useOnboardingStore,
  RESIDENCIES,
  type Residency,
} from "@/store/onboarding";
import {
  getPortfolio,
  getCapitalGainsTax,
  getFeeReductionTactics,
  getTaxReductionLevers,
  BROKER_SHORT_NAME,
  type Broker,
  type Position,
} from "@/lib/portfolio";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";

const TLOSS_TIP_TEXT =
  "Selling this position could help offset gains elsewhere. Educational information only — not a recommendation.";

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function formatPct(rate: number): string {
  return Number((rate * 100).toFixed(1)).toString();
}

export function TaxInsightsPage({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const brokers = useOnboardingStore((s) => s.brokers) as Broker[];
  const risk = useOnboardingStore((s) => s.risk);
  const residency = useOnboardingStore((s) => s.residency);
  const setResidency = useOnboardingStore((s) => s.setResidency);

  const [openBlocks, setOpenBlocks] = useState({
    tloss: true,
    calc: true,
    fees: true,
  });
  const closeBlock = (key: keyof typeof openBlocks) =>
    setOpenBlocks((prev) => ({ ...prev, [key]: false }));

  if (brokers.length === 0 || !risk) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-10 py-9">
        <TopBrand />
        <div className="max-w-xl text-center font-fraunces text-xl font-semibold text-ivory">
          Complete onboarding to see your tax insights.
        </div>
        <Disclaimer />
      </div>
    );
  }

  const portfolio = getPortfolio(brokers, risk);

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bottom-16 flex flex-col items-center overflow-y-auto px-10 pt-[58px] pb-9">
        <TopBrand />
        <div className="mb-1 font-mono text-[10px] tracking-[0.12em] text-amber-dim uppercase">
          Page 8
        </div>
        <div className="mb-1.5 font-fraunces text-[17px] font-semibold text-ivory">
          Tax insights for your portfolio
        </div>
        <div
          className="mb-4 max-w-[560px] text-center font-sans text-[9.5px] leading-relaxed text-amber-dim"
          data-testid="tax-footnote"
        >
          Tax and fee figures are illustrative and based on publicly available
          data as of June 2026; rates and schedules change — always verify
          with your broker and tax advisor before acting.
        </div>

        {residency === null ? (
          <ResidencyGate onSelect={setResidency} />
        ) : (
          <div
            className="flex w-full max-w-[960px] flex-wrap justify-center gap-4"
            data-testid="tax-blocks"
          >
            {openBlocks.tloss && (
              <TaxLossBlock
                positions={portfolio.positions}
                onClose={() => closeBlock("tloss")}
              />
            )}
            {openBlocks.calc && (
              <TaxCalcBlock
                residency={residency}
                onClose={() => closeBlock("calc")}
              />
            )}
            {openBlocks.fees && (
              <FeeTacticsBlock
                brokers={brokers}
                residency={residency}
                onClose={() => closeBlock("fees")}
              />
            )}
          </div>
        )}
      </div>

      <Disclaimer />

      <button
        type="button"
        aria-label="Previous page"
        data-testid="tax-prev-arrow"
        onClick={onPrev}
        className="absolute top-1/2 left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8249;
      </button>
      <button
        type="button"
        aria-label="Next page"
        data-testid="tax-next-arrow"
        onClick={onNext}
        className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8250;
      </button>
    </div>
  );
}

function ResidencyGate({
  onSelect,
}: {
  onSelect: (r: Residency) => void;
}) {
  return (
    <div
      className="rounded-[14px] border border-panel-border bg-panel px-[26px] py-[22px] text-center backdrop-blur-md"
      data-testid="tax-residency-gate"
    >
      <p className="mb-3 font-fraunces text-[15px] text-ivory">
        What is your tax residence?
      </p>
      <div className="flex max-w-[360px] flex-wrap justify-center gap-2">
        {RESIDENCIES.map((r) => (
          <div
            key={r}
            className="res-opt cursor-pointer rounded-md bg-silver px-3.5 py-2 font-mono text-[11px] font-semibold text-[#111] transition hover:bg-silver-hi"
            data-testid={`tax-residency-${r}`}
            onClick={() => onSelect(r)}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxLossBlock({
  positions,
  onClose,
}: {
  positions: Position[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (symbol: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });

  return (
    <div
      className="relative w-[290px] rounded-[14px] border border-panel-border bg-panel p-4"
      data-testid="tax-block-tloss"
    >
      <span
        className="tax-close absolute top-[10px] right-3 cursor-pointer font-bold text-red"
        data-testid="tax-close-tloss"
        onClick={onClose}
      >
        &#10005;
      </span>
      <h4 className="mb-2.5 font-fraunces text-[13.5px] font-semibold text-ivory">
        Tax-Loss Opportunities
      </h4>
      <div>
        {positions.map((p) => {
          const isLoss = p.underwater;
          const lossPct = (p.unrealizedGainLoss / p.costBasis) * 100;
          return (
            <div key={p.symbol}>
              <div
                className={`flex items-center justify-between border-b border-white/5 py-1.5 font-mono text-[11px] ${
                  isLoss ? "cursor-pointer text-red" : "text-ivory"
                }`}
                data-testid={`tax-loss-row-${p.symbol}`}
                onClick={isLoss ? () => toggle(p.symbol) : undefined}
              >
                <span>{p.symbol}</span>
                <span>{isLoss ? `${lossPct.toFixed(1)}%` : "—"}</span>
              </div>
              {isLoss && expanded.has(p.symbol) && (
                <div
                  className="mt-1 mb-1 font-sans text-[9.5px] leading-relaxed text-muted"
                  data-testid={`tax-loss-tip-${p.symbol}`}
                >
                  <div
                    className="font-mono text-[10px] text-red"
                    data-testid={`tax-loss-detail-${p.symbol}`}
                  >
                    {lossPct.toFixed(1)}% &middot; {formatUsd(p.unrealizedGainLoss)}
                  </div>
                  <div data-testid={`tax-loss-copy-${p.symbol}`}>
                    {TLOSS_TIP_TEXT}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaxCalcBlock({
  residency,
  onClose,
}: {
  residency: Residency;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const amt = parseFloat(amount) || 0;
  const cgt = getCapitalGainsTax(residency);

  const resultText =
    amt > 0
      ? `Estimated CGT range (${residency}): ${formatUsd(amt * cgt.typicalRateLow)} – ${formatUsd(amt * cgt.typicalRateHigh)} (${formatPct(cgt.typicalRateLow)}–${formatPct(cgt.typicalRateHigh)}%)`
      : "Enter an amount to see the estimated range.";

  return (
    <div
      className="relative w-[290px] rounded-[14px] border border-panel-border bg-panel p-4"
      data-testid="tax-block-calc"
    >
      <span
        className="tax-close absolute top-[10px] right-3 cursor-pointer font-bold text-red"
        data-testid="tax-close-calc"
        onClick={onClose}
      >
        &#10005;
      </span>
      <h4 className="mb-2.5 font-fraunces text-[13.5px] font-semibold text-ivory">
        Tax Impact Before Trades
      </h4>
      <input
        type="number"
        placeholder="Hypothetical sale amount, $"
        className="mb-2.5 w-full rounded-md border border-panel-border bg-white/5 px-2.5 py-2 font-mono text-xs text-ivory"
        data-testid="tax-sell-amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div
        className="font-mono text-xs text-amber"
        data-testid="tax-calc-result"
      >
        {resultText}
      </div>
    </div>
  );
}

function FeeTacticsBlock({
  brokers,
  residency,
  onClose,
}: {
  brokers: Broker[];
  residency: Residency;
  onClose: () => void;
}) {
  const [activeBroker, setActiveBroker] = useState<Broker>(brokers[0]);
  const tactic = getFeeReductionTactics(activeBroker);
  const levers = getTaxReductionLevers(residency);

  return (
    <div
      className="relative w-[290px] rounded-[14px] border border-panel-border bg-panel p-4"
      data-testid="tax-block-fees"
    >
      <span
        className="tax-close absolute top-[10px] right-3 cursor-pointer font-bold text-red"
        data-testid="tax-close-fees"
        onClick={onClose}
      >
        &#10005;
      </span>
      <h4 className="mb-2.5 font-fraunces text-[13.5px] font-semibold text-ivory">
        Reduce Unnecessary Tax Costs
      </h4>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {brokers.map((b) => {
          const shortName = BROKER_SHORT_NAME[b];
          return (
            <span
              key={b}
              className={`htab cursor-pointer rounded-[5px] px-2.5 py-1 font-mono text-[10px] ${
                activeBroker === b
                  ? "bg-amber font-bold text-[#1a1400]"
                  : "bg-white/[0.06] text-ivory"
              }`}
              data-testid={`tax-fee-tab-${shortName}`}
              onClick={() => setActiveBroker(b)}
            >
              {shortName}
            </span>
          );
        })}
      </div>
      <div
        className="font-sans text-[11px] leading-relaxed text-muted"
        data-testid="tax-tactic-text"
      >
        <div>What reduces your fees: {tactic.whatReducesYourFees}</div>
        <div className="mt-1.5">Watch out for: {tactic.watchOutFor}</div>
      </div>
      <div
        className="mt-2.5 border-t border-line pt-2.5 font-sans text-[11px] leading-relaxed text-muted"
        data-testid="tax-lever-text"
      >
        <div>Real, legitimate levers: {levers.realLegitimateLevers}</div>
        <div className="mt-1.5">What does NOT work: {levers.whatDoesNotWork}</div>
      </div>
    </div>
  );
}
