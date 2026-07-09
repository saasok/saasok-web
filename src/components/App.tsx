"use client";

import { useEffect, useState } from "react";
import { BrandMark, TopBrand } from "./BrandMark";
import { Disclaimer } from "./Disclaimer";

const TOTAL_PAGES = 10;

export function App() {
  const [page, setPage] = useState(1);
  const [coverShow, setCoverShow] = useState({
    tagline: false,
    brandmark: false,
    logo: false,
  });

  useEffect(() => {
    if (page !== 1) return;
    const timers = [
      setTimeout(() => setCoverShow((s) => ({ ...s, tagline: true })), 250),
      setTimeout(() => setCoverShow((s) => ({ ...s, brandmark: true })), 900),
      setTimeout(() => setCoverShow((s) => ({ ...s, logo: true })), 1150),
      setTimeout(() => setPage(2), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [page]);

  const goToPage = (n: number) => {
    if (n === 1) {
      setCoverShow({ tagline: false, brandmark: false, logo: false });
    }
    setPage(Math.min(Math.max(n, 1), TOTAL_PAGES));
  };

  return (
    <div
      className="relative h-dvh min-h-[660px] w-full overflow-hidden text-ivory"
      style={{
        background:
          "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(214,176,76,0.07), transparent 60%), radial-gradient(ellipse 1200px 800px at 50% 110%, var(--bg-navy-2) 0%, var(--bg-deep) 70%)",
      }}
    >
      {page > 1 && <ProgressDots current={page} />}

      {page === 1 && (
        <div className="flex h-full flex-col items-center justify-center gap-[22px]">
          <div
            className={`font-fraunces text-center text-[25px] font-medium italic transition-all duration-1000 ease-out ${
              coverShow.tagline
                ? "translate-y-0 opacity-100"
                : "translate-y-3.5 opacity-0"
            }`}
          >
            Get your edge up by <span className="not-italic">SaaSok</span>
          </div>
          <div
            className={`transition-all duration-700 ${
              coverShow.brandmark ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <BrandMark />
          </div>
          <div
            className={`font-fraunces text-[34px] font-semibold tracking-wide transition-all duration-700 ${
              coverShow.logo
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            SaaS<em className="text-muted font-medium not-italic italic">ok</em>
          </div>
        </div>
      )}

      {page > 1 && page < TOTAL_PAGES && (
        <PlaceholderPage page={page} onNav={goToPage} />
      )}

      {page === TOTAL_PAGES && <ClosingPage onRestart={() => goToPage(1)} />}
    </div>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="absolute bottom-4 right-[22px] z-20 flex gap-1.5">
      {Array.from({ length: TOTAL_PAGES - 1 }, (_, i) => i + 2).map((n) => (
        <div
          key={n}
          className={`h-[5px] rounded-full transition-all duration-200 ${
            n === current ? "w-3.5 bg-amber" : "w-[5px] bg-white/[0.18]"
          }`}
        />
      ))}
    </div>
  );
}

function PlaceholderPage({
  page,
  onNav,
}: {
  page: number;
  onNav: (n: number) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-9">
      <TopBrand />
      <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.14em] text-amber-dim uppercase">
        Page {page} of {TOTAL_PAGES}
      </div>
      <div className="mb-9 max-w-xl text-center font-fraunces text-2xl font-semibold leading-snug">
        Coming soon
        <small className="mt-2 block font-sans text-xs font-normal text-muted">
          This step of the SaaSok experience is under construction.
        </small>
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-md border border-panel-border px-6 py-3 font-sans text-[13.5px] font-semibold tracking-wide text-ivory transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={() => onNav(page - 1)}
          disabled={page <= 1}
        >
          Back
        </button>
        <button
          className="rounded-md bg-silver px-9 py-3 font-sans text-[13.5px] font-semibold tracking-wide text-[#111] transition hover:bg-silver-hi hover:-translate-y-px"
          onClick={() => onNav(page + 1)}
        >
          Next page
        </button>
      </div>
      <Disclaimer />
    </div>
  );
}

function ClosingPage({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <BrandMark />
      <div className="font-fraunces text-[34px] font-semibold tracking-wide">
        SaaS<em className="text-muted font-medium not-italic italic">ok</em>
      </div>
      <div className="font-fraunces text-xl italic text-ivory">
        Now you are edged up by SaaSok!
      </div>
      <div className="max-w-[340px] text-center font-fraunces text-[15px] italic text-muted">
        Thank you for participating in our research! Every response makes
        SaaSok better.
      </div>
      <button
        className="mt-2.5 rounded-full border border-panel-border px-4 py-2 font-mono text-[10.5px] text-muted transition hover:border-amber-dim hover:text-ivory"
        onClick={onRestart}
      >
        Restart demo
      </button>
    </div>
  );
}
