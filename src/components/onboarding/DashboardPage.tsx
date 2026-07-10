"use client";

import { Cell, Pie, PieChart } from "recharts";
import { useOnboardingStore } from "@/store/onboarding";
import {
  getPortfolio,
  getSectorBreakdown,
  summarizeFees,
  type Broker,
} from "@/lib/portfolio";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";

const SECTOR_COLORS = [
  "#D6B04C",
  "#7C9BC4",
  "#4CB88A",
  "#DD6B57",
  "#C08FE0",
  "#5AB8C4",
  "#8FA0C7",
  "#B98D5E",
];

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function formatYears(years: string): string {
  return years.replace("-", "–") + " years";
}

export function DashboardPage({ onNext }: { onNext: () => void }) {
  const brokers = useOnboardingStore((s) => s.brokers) as Broker[];
  const risk = useOnboardingStore((s) => s.risk);
  const years = useOnboardingStore((s) => s.years);

  if (brokers.length === 0 || !risk) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-10 py-9">
        <TopBrand />
        <div className="max-w-xl text-center font-fraunces text-xl font-semibold text-ivory">
          Complete onboarding to see your dashboard.
        </div>
        <Disclaimer />
      </div>
    );
  }

  const portfolio = getPortfolio(brokers, risk);
  const sectors = getSectorBreakdown(portfolio.positions);
  const feeSummary = summarizeFees(brokers, portfolio.total);

  return (
    <div className="relative flex h-full flex-col items-center overflow-y-auto px-10 pt-[58px] pb-9">
      <TopBrand />
      <div
        className="mb-1 font-mono text-[10px] tracking-[0.12em] text-amber-dim uppercase"
        data-testid="dashboard-subtitle"
      >
        {risk} profile
        {years ? ` · ${formatYears(years)} experience` : ""}
      </div>
      <div className="mb-3.5 font-fraunces text-[17px] font-semibold text-ivory">
        Unified Portfolio Dashboard
      </div>

      <div className="flex w-full max-w-[1020px] flex-wrap items-start justify-center gap-5">
        <div className="w-[330px] rounded-2xl border border-panel-border bg-panel p-5 backdrop-blur-sm">
          <h3
            className="mb-0.5 font-fraunces text-sm font-semibold text-ivory"
            data-testid="dashboard-broker-label"
          >
            {portfolio.brokerLabel}
          </h3>
          <div
            className="mb-3 font-mono text-2xl font-semibold text-amber"
            data-testid="dashboard-total"
          >
            {formatUsd(portfolio.total)}
          </div>
          <div
            className="max-h-[380px] overflow-y-auto pr-1"
            data-testid="dashboard-positions"
          >
            {portfolio.positions.map((p) => (
              <div
                key={p.symbol}
                className="flex justify-between border-b border-white/5 py-1.5 font-mono text-[11px]"
                data-testid={`dashboard-position-${p.symbol}`}
              >
                <span className="font-semibold text-ivory">
                  {p.symbol}
                  {p.underwater && (
                    <span
                      className="ml-1 text-[8px] text-red"
                      aria-label="unrealized loss"
                      data-testid={`dashboard-loss-dot-${p.symbol}`}
                    >
                      &#9679;
                    </span>
                  )}
                </span>
                <span className="font-sans text-[10.5px] text-muted-dim">
                  {p.type}
                </span>
                <span>{formatUsd(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-[198px] flex-col items-center gap-2.5 rounded-2xl border border-panel-border bg-panel p-4">
          <PieChart width={140} height={140} data-testid="dashboard-pie">
            <Pie
              data={sectors}
              dataKey="value"
              nameKey="sector"
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={62}
              stroke="#0A1330"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {sectors.map((s, i) => (
                <Cell key={s.sector} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="font-mono text-[10.5px] tracking-wide text-muted">
            BY SECTOR
          </div>
          <div
            className="flex w-full flex-col gap-1 font-sans text-[10.5px]"
            data-testid="dashboard-sector-legend"
          >
            {sectors.map((s, i) => (
              <div key={s.sector} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-[2px]"
                  style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                />
                {s.sector} — {Math.round(s.pct * 100)}%
              </div>
            ))}
          </div>
        </div>

        <div className="w-64 rounded-2xl border border-panel-border bg-panel p-4">
          <h4 className="mb-2.5 font-fraunces text-[13px] font-semibold text-ivory">
            Fee &amp; Cost Optimization
          </h4>
          <div className="mb-1.5 flex justify-between font-mono text-[10.5px] text-muted">
            <span>FX conversion cost</span>
            <b className="text-ivory" data-testid="dashboard-fx-fee">
              {feeSummary.fxConversionFeeUsd === null
                ? "Not disclosed"
                : formatUsd(feeSummary.fxConversionFeeUsd)}
            </b>
          </div>
          <div className="mb-2 flex justify-between font-mono text-[10.5px] text-muted">
            <span>Custody / platform fees</span>
            <b className="text-ivory" data-testid="dashboard-custody-fee">
              {formatUsd(feeSummary.custodyFeeAnnualUsd)}
            </b>
          </div>
          <div className="flex flex-col gap-1.5 font-sans text-[10px] leading-snug text-muted-dim">
            {feeSummary.fees.map((f) => (
              <div key={f.broker}>
                <span className="font-semibold text-muted">{f.broker}:</span>{" "}
                {f.stockEtfCommission}
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-line pt-2 font-sans text-[10px] leading-relaxed text-muted-dim">
            Estimates from published broker rates applied to your portfolio
            total — illustrative, not investment advice.
          </div>
        </div>
      </div>

      <Disclaimer />

      <button
        type="button"
        aria-label="Next page"
        data-testid="dashboard-next-arrow"
        onClick={onNext}
        className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8250;
      </button>
    </div>
  );
}
