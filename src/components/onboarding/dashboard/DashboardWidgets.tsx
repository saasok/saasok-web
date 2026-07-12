"use client";

import { useEffect, useState } from "react";
import { MarketCalendar } from "./MarketCalendar";
import { PelosiWidget } from "./PelosiWidget";
import { WarshWidget } from "./WarshWidget";
import { NewsWidget } from "./NewsWidget";

const REVEAL_DELAYS_MS = {
  calendar: 7000,
  pelosi: 7500,
  warsh: 8000,
  news: 8500,
} as const;

type RevealState = Record<keyof typeof REVEAL_DELAYS_MS, boolean>;

const INITIAL_REVEAL: RevealState = {
  calendar: false,
  pelosi: false,
  warsh: false,
  news: false,
};

export function DashboardWidgets() {
  const [revealed, setRevealed] = useState<RevealState>(INITIAL_REVEAL);

  useEffect(() => {
    const timers = (
      Object.entries(REVEAL_DELAYS_MS) as [keyof RevealState, number][]
    ).map(([key, delay]) =>
      setTimeout(() => {
        setRevealed((prev) => ({ ...prev, [key]: true }));
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <MarketCalendar revealed={revealed.calendar} />
      <div
        className="relative mx-auto mt-[240px] h-[480px] w-[97%] max-w-[980px]"
        data-testid="widgets-zone"
      >
        <PelosiWidget revealed={revealed.pelosi} />
        <WarshWidget revealed={revealed.warsh} />
        <NewsWidget revealed={revealed.news} />
      </div>
    </>
  );
}
