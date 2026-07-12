"use client";

import { CollapsibleWidget } from "./CollapsibleWidget";
import pelosiData from "../../../../data/pelosi-trades.json";

interface PelosiTrade {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  amountRange: string;
}

const trades = (pelosiData as unknown as { trades: PelosiTrade[] }).trades;

export function PelosiWidget({ revealed }: { revealed: boolean }) {
  return (
    <CollapsibleWidget
      testId="widget-pelosi"
      title="Nancy Pelosi Trades"
      positionClassName="left-0 bottom-0 w-[280px]"
      revealed={revealed}
      totalRows={trades.length}
      scrollHintLabel={`↕ scroll for more · showing 10 of ${trades.length}`}
      renderRow={(index) => {
        const t = trades[index];
        return (
          <div
            className="flex items-center gap-1.5 border-b border-[#eee] px-2.5 py-1.5 font-mono text-[10px]"
            data-testid={`widget-pelosi-row-${t.ticker}-${t.date}`}
          >
            <span>{t.date}</span>
            <b>{t.ticker}</b>
            <span
              className={`rounded-[10px] px-1.5 py-0.5 font-sans text-[9px] font-bold text-white ${
                t.action === "buy" ? "bg-green" : "bg-red"
              }`}
              data-testid={`widget-pelosi-tag-${t.ticker}-${t.date}`}
            >
              {t.action === "buy" ? "BUY" : "SELL"}
            </span>
            <span
              className={`ml-auto ${t.action === "buy" ? "text-green" : "text-red"}`}
              data-testid={`widget-pelosi-amount-${t.ticker}-${t.date}`}
            >
              {t.amountRange}
            </span>
          </div>
        );
      }}
    />
  );
}
