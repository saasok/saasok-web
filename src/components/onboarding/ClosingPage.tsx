"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "../BrandMark";

// Mirrors docs/mockup.html's playClosing/restartDemo timings exactly.
const THANKS_DELAY_MS = 900;
const RESTART_DELAY_MS = 2600;
const COLLAPSE_DURATION_MS = 900;

export function ClosingPage({ onRestart }: { onRestart: () => void }) {
  const [show, setShow] = useState({ thanks: false, restart: false });
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(
        () => setShow((s) => ({ ...s, thanks: true })),
        THANKS_DELAY_MS,
      ),
      setTimeout(
        () => setShow((s) => ({ ...s, restart: true })),
        RESTART_DELAY_MS,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleRestart = () => {
    setCollapsing(true);
    // Let the collapse transition play before resetting the store — resetting
    // immediately would swap this page out for CoverPage mid-animation.
    setTimeout(onRestart, COLLAPSE_DURATION_MS);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div
        data-testid="closing-wrap"
        className={`flex flex-col items-center gap-4 transition-all duration-[1400ms] ease-out ${
          collapsing ? "scale-[0.85] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <BrandMark />
        <div className="font-fraunces text-[34px] font-semibold tracking-wide">
          SaaS<em className="text-muted font-medium not-italic italic">ok</em>
        </div>
        <div className="font-fraunces text-xl italic text-ivory">
          Now you are edged up by SaaSok!
        </div>
        <div
          data-testid="closing-thanks"
          className={`max-w-[340px] text-center font-fraunces text-[15px] italic text-muted transition-opacity duration-[1200ms] ease-out ${
            show.thanks ? "opacity-100" : "opacity-0"
          }`}
        >
          Thank you for participating in our research! Every response makes
          SaaSok better.
        </div>
        <button
          type="button"
          data-testid="closing-restart"
          onClick={handleRestart}
          className={`mt-2.5 rounded-full border border-panel-border px-4 py-2 font-mono text-[10.5px] text-muted transition-opacity duration-1000 ease-out hover:border-amber-dim hover:text-ivory ${
            show.restart ? "opacity-100" : "opacity-0"
          }`}
        >
          Restart demo
        </button>
      </div>
    </div>
  );
}
