"use client";

import { Years, useOnboardingStore } from "@/store/onboarding";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";
import { NextButton } from "./NextButton";
import { OptionBox } from "./OptionBox";

const YEARS_OPTIONS: { value: Years; label: string }[] = [
  { value: "1-4", label: "1–4 years" },
  { value: "5-9", label: "5–9 years" },
  { value: "10+", label: "10+ years" },
];

const BACKGROUND = "linear-gradient(160deg,#3A3F63,#282C46)";

export function YearsPage() {
  const years = useOnboardingStore((s) => s.years);
  const setYears = useOnboardingStore((s) => s.setYears);
  const goTo = useOnboardingStore((s) => s.goTo);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-9">
      <TopBrand />
      <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.14em] text-amber-dim uppercase">
        Step 3 of 3
      </div>
      <div className="mb-9 max-w-xl text-center font-fraunces text-2xl font-semibold leading-snug">
        How many years do you work with brokerage?
      </div>
      <div className="mb-9 flex max-w-[640px] flex-wrap justify-center gap-4">
        {YEARS_OPTIONS.map((opt) => (
          <OptionBox
            key={opt.value}
            testId={`years-${opt.value}`}
            selected={years === opt.value}
            onClick={() => setYears(opt.value)}
            background={BACKGROUND}
            className="w-[190px] min-h-16 text-[13px]"
          >
            {opt.label}
          </OptionBox>
        ))}
      </div>
      <NextButton disabled={years === null} onClick={() => goTo("pageLoad")}>
        Consolidate your portfolio
      </NextButton>
      <Disclaimer />
    </div>
  );
}
