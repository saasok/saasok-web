"use client";

import { useRef } from "react";
import { PAGE_ORDER, PageId, useOnboardingStore } from "@/store/onboarding";
import { useBackNavigationLock } from "@/hooks/useBackNavigationLock";
import { useFocusableActivation } from "@/hooks/useFocusableActivation";
import { CoverPage } from "./onboarding/CoverPage";
import { BrokersPage } from "./onboarding/BrokersPage";
import { RiskPage } from "./onboarding/RiskPage";
import { YearsPage } from "./onboarding/YearsPage";
import { LoadingPage } from "./onboarding/LoadingPage";
import { DashboardPage } from "./onboarding/DashboardPage";
import { CompetitiveAssetPage } from "./onboarding/CompetitiveAssetPage";
import { CorrelationAnalysisPage } from "./onboarding/CorrelationAnalysisPage";
import { TaxInsightsPage } from "./onboarding/TaxInsightsPage";
import { ScenarioStudioPage } from "./onboarding/ScenarioStudioPage";
import { ClosingPage } from "./onboarding/ClosingPage";

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
      {page === "page7" && (
        <CorrelationAnalysisPage
          onNext={() => goTo("page8")}
          onPrev={() => goBack("page6")}
        />
      )}
      {page === "page8" && (
        <TaxInsightsPage
          onNext={() => goTo("page9")}
          onPrev={() => goBack("page7")}
        />
      )}
      {page === "page9" && (
        <ScenarioStudioPage
          onNext={() => goTo("page10")}
          onPrev={() => goBack("page8")}
        />
      )}
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
