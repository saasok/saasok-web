"use client";

import { useState } from "react";
import { COMPETITIVE_ASSETS } from "@/lib/competitiveAssets";
import { exportCompetitiveAssetsWorkbook } from "@/lib/exportCompetitiveAssets";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";

export function CompetitiveAssetPage({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const asset = COMPETITIVE_ASSETS[selectedIndex];

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bottom-16 flex flex-col items-center overflow-y-auto px-10 pt-[58px] pb-9">
        <TopBrand />
        <div className="mb-1 font-mono text-[10px] tracking-[0.12em] text-amber-dim uppercase">
          Page 6
        </div>
        <div className="mb-3.5 font-fraunces text-[17px] font-semibold text-ivory">
          Competitive Asset View
        </div>
        <div
          className="mb-3.5 font-mono text-[10.5px] tracking-wide text-amber-dim"
          data-testid="asset-warning"
        >
          Pick one of the 20 assets — unlimited attempts
        </div>

        <div className="flex w-full max-w-[720px] items-start justify-center gap-5">
          <div
            className="w-[520px] rounded-2xl border border-panel-border bg-panel p-6"
            data-testid="asset-mockup"
          >
            <div className="font-mono text-[11px] tracking-[0.06em] text-amber">
              {asset.ticker}
            </div>
            <h3
              className="mt-0.5 mb-0.5 font-fraunces text-xl font-semibold text-ivory"
              data-testid="asset-mockup-name"
            >
              {asset.name}
            </h3>
            <div
              className="mb-4 font-mono text-[13px] text-muted"
              data-testid="asset-mockup-cap"
            >
              Market cap ≈ {asset.marketCap}
            </div>
            <div>
              {asset.peers.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-2 border-b border-white/[0.06] py-2.5 text-xs"
                  data-testid={`asset-peer-${p.name}`}
                >
                  <span className="font-semibold text-ivory">{p.name}</span>
                  <span className="font-mono text-amber">{p.marketCap}</span>
                  <span className="max-w-[230px] text-right text-[10.5px] text-muted-dim">
                    {p.regions}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="max-h-[320px] w-[150px] overflow-y-auto rounded-xl border border-panel-border bg-panel"
            data-testid="asset-list"
          >
            {COMPETITIVE_ASSETS.map((a, i) => (
              <button
                type="button"
                key={a.ticker}
                data-testid={`asset-item-${a.ticker}`}
                data-active={i === selectedIndex}
                onClick={() => setSelectedIndex(i)}
                className={`block w-full border-b border-white/5 px-3.5 py-2.5 text-left font-mono text-[11.5px] transition ${
                  i === selectedIndex
                    ? "bg-amber/[0.14] text-amber"
                    : "text-ivory hover:bg-white/5"
                }`}
              >
                {a.ticker} · {a.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          data-testid="save-results-button"
          onClick={() => exportCompetitiveAssetsWorkbook()}
          className="mt-5 rounded-md bg-silver px-6 py-2.5 font-sans text-[12.5px] font-semibold text-[#111] transition hover:bg-silver-hi"
        >
          Save results of analysis
        </button>
      </div>

      <Disclaimer />

      <button
        type="button"
        aria-label="Previous page"
        data-testid="competitive-prev-arrow"
        onClick={onPrev}
        className="absolute top-1/2 left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8249;
      </button>
      <button
        type="button"
        aria-label="Next page"
        data-testid="competitive-next-arrow"
        onClick={onNext}
        className="absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-silver text-[15px] font-bold text-[#151515] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition hover:scale-[1.06] hover:bg-silver-hi"
      >
        &#8250;
      </button>
    </div>
  );
}
