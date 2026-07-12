"use client";

import { useState } from "react";
import { useHoverDuration } from "@/hooks/useHoverDuration";
import exchangesData from "../../../../data/exchanges.json";

interface ExchangeInfo {
  name: string;
  hours: string;
  preMarket: string;
  afterMarket: string;
  daysOff: string;
  holidays: string;
  urgentNote: string;
}

const exchanges = (exchangesData as unknown as { exchanges: ExchangeInfo[] })
  .exchanges;

export function MarketCalendar({ revealed }: { revealed: boolean }) {
  const [pickedSet, setPickedSet] = useState<Set<string>>(new Set());
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const { onMouseEnter, onMouseLeave } = useHoverDuration("calendar");

  const togglePicked = (name: string) => {
    setPickedSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearAll = () => {
    setPickedSet(new Set());
    setHoveredName(null);
  };

  return (
    <div
      className={`relative mx-auto mt-6 w-[94%] max-w-[940px] transition-opacity duration-700 ${
        revealed ? "opacity-100" : "opacity-0"
      }`}
      data-testid="calendar-wrap"
      data-revealed={revealed}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="flex w-full overflow-visible rounded-[7px] shadow-[0_10px_26px_rgba(0,0,0,0.3)]"
        data-testid="calendar-strip"
      >
        {exchanges.map((ex) => {
          const isPicked = pickedSet.has(ex.name);
          const isOpen = isPicked || hoveredName === ex.name;
          return (
            <div
              key={ex.name}
              className={`exch relative flex-1 cursor-pointer border-r border-black/[0.08] px-0.5 py-2.5 text-center font-mono text-[10px] font-semibold tracking-[0.01em] transition-colors last:border-r-0 first:rounded-l-[7px] last:rounded-r-[7px] ${
                isPicked ? "bg-silver-active" : "bg-silver hover:bg-silver-hi"
              }`}
              data-testid={`exchange-${ex.name}`}
              data-picked={isPicked}
              onMouseEnter={() => setHoveredName(ex.name)}
              onMouseLeave={() =>
                setHoveredName((h) => (h === ex.name ? null : h))
              }
              onClick={() => togglePicked(ex.name)}
            >
              {ex.name}
              <div
                className={`exch-panel absolute top-full left-0 z-[6] w-[196px] overflow-hidden rounded-b-[9px] bg-[#F6F6F8] font-sans text-[10.5px] leading-[1.7] text-[#161616] shadow-[0_14px_28px_rgba(0,0,0,0.4)] transition-all ${
                  isOpen ? "max-h-[220px] p-3 opacity-100" : "max-h-0 p-0 opacity-0"
                }`}
                data-testid={`exchange-panel-${ex.name}`}
                data-open={isOpen}
              >
                <b className="mb-1 block font-fraunces text-[12px] font-semibold">
                  {ex.name}
                </b>
                Trading: {ex.hours}
                <br />
                Pre-market: {ex.preMarket}
                <br />
                After-market: {ex.afterMarket}
                <br />
                Days off: {ex.daysOff}
                <br />
                Holidays: {ex.holidays}
                <br />
                Urgent: {ex.urgentNote}
              </div>
            </div>
          );
        })}
      </div>
      {pickedSet.size > 0 && (
        <div
          className="cal-close absolute top-full right-0 mt-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-black/25 text-[11px] font-bold text-red"
          data-testid="calendar-clear"
          onClick={clearAll}
        >
          &#10005;
        </div>
      )}
    </div>
  );
}
