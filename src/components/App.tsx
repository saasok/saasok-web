"use client";

import { useRef } from "react";
import { PAGE_ORDER, PageId, useOnboardingStore } from "@/store/onboarding";
import { useBackNavigationLock } from "@/hooks/useBackNavigationLock";
import { useFocusableActivation } from "@/hooks/useFocusableActivation";
import { BrandMark, TopBrand } from "./BrandMark";
import { Disclaimer } from "./Disclaimer";
import { CoverPage } from "./onboarding/CoverPage";
import { BrokersPage } from "./onboarding/BrokersPage";
import { RiskPage } from "./onboarding/RiskPage";
import { YearsPage } from "./onboarding/YearsPage";
import { LoadingPage } from "./onboarding/LoadingPage";
import { DashboardPage } from "./onboarding/DashboardPage";
import { CompetitiveAssetPage } from "./onboarding/CompetitiveAssetPage";

const PAGE_NUMBER: Partial<Record<PageId, number>> = {
  page2: 2,
  page3: 3,
  page4: 4,
  page5: 5,
  page6: 6,
  page7: 7,
  page8: 8,
  page9: 9,
  page10: 10,
};

export function App() {
  const page = useOnboardingStore((s) => s.page);
  const goTo = useOnboardingStore((s) => s.goTo);
  const goBack = useOnboardingStore((s) => s.goBack);
  const reset = useOnboardingStore((s) => s.reset);
  const containerRef = useRef<HTMLDivElement>(null);

  useBackNavigationLock(page);
  useFocusableActivation(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative h-dvh min-h-[660px] w-full overflow-hidden text-ivory"
      style={{
        background:
          "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(214,176,76,0.07), transparent 60%), radial-gradient(ellipse 1200px 800px at 50% 110%, var(--bg-navy-2) 0%, var(--bg-deep) 70%)",
      }}
    >
      {PAGE_NUMBER[page] !== undefined && <ProgressDots current={page} />}

      {page === "page1" && <CoverPage />}
      {page === "page2" && <BrokersPage />}
      {page === "page3" && <RiskPage />}
      {page === "page4" && <YearsPage />}
      {page === "pageLoad" && <LoadingPage />}
      {page === "page5" && <DashboardPage onNext={() => goTo("page6")} />}
      {page === "page6" && (
        <CompetitiveAssetPage
          onNext={() => goTo("page7")}
          onPrev={() => goBack("page5")}
        />
      )}
      {page === "page7" && <PlaceholderPage page={page} onNext={() => goTo("page8")} />}
      {page === "page8" && <PlaceholderPage page={page} onNext={() => goTo("page9")} />}
      {page === "page9" && <PlaceholderPage page={page} onNext={() => goTo("page10")} />}
      {page === "page10" && <ClosingPage onRestart={reset} />}
    </div>
  );
}

function ProgressDots({ current }: { current: PageId }) {
  const currentNumber = PAGE_NUMBER[current];
  return (
    <div className="absolute bottom-4 right-[22px] z-20 flex gap-1.5">
      {PAGE_ORDER.filter((p) => PAGE_NUMBER[p] !== undefined).map((p) => (
        <div
          key={p}
          className={`h-[5px] rounded-full transition-all duration-200 ${
            p === current || PAGE_NUMBER[p] === currentNumber
              ? "w-3.5 bg-amber"
              : "w-[5px] bg-white/[0.18]"
          }`}
        />
      ))}
    </div>
  );
}

function PlaceholderPage({
  page,
  onNext,
}: {
  page: PageId;
  onNext: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-9">
      <TopBrand />
      <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.14em] text-amber-dim uppercase">
        Page {PAGE_NUMBER[page]} of {PAGE_ORDER.length - 1}
      </div>
      <div className="mb-9 max-w-xl text-center font-fraunces text-2xl font-semibold leading-snug">
        Coming soon
        <small className="mt-2 block font-sans text-xs font-normal text-muted">
          This step of the SaaSok experience is under construction.
        </small>
      </div>
      <button
        className="rounded-md bg-silver px-9 py-3 font-sans text-[13.5px] font-semibold tracking-wide text-[#111] transition hover:-translate-y-px hover:bg-silver-hi"
        onClick={onNext}
      >
        Next page
      </button>
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
