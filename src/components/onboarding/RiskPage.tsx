"use client";

import { useTranslations } from "next-intl";
import { Risk, useOnboardingStore } from "@/store/onboarding";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";
import { NextButton } from "./NextButton";
import { OptionBox } from "./OptionBox";

const RISK_BACKGROUND: Record<Risk, string> = {
  conservative: "linear-gradient(160deg,#2E5C8A,#1F3F63)",
  moderate: "linear-gradient(160deg,#3B6E52,#284A38)",
  aggressive: "linear-gradient(160deg,#8A4A3B,#602F24)",
};

export function RiskPage() {
  const risk = useOnboardingStore((s) => s.risk);
  const setRisk = useOnboardingStore((s) => s.setRisk);
  const goTo = useOnboardingStore((s) => s.goTo);
  const t = useTranslations("risk");
  const tc = useTranslations("common");

  const RISK_OPTIONS: {
    value: Risk;
    label: string;
    sub: string;
    background: string;
  }[] = [
    {
      value: "conservative",
      label: t("conservative"),
      sub: t("conservativeSub"),
      background: RISK_BACKGROUND.conservative,
    },
    {
      value: "moderate",
      label: t("moderate"),
      sub: t("moderateSub"),
      background: RISK_BACKGROUND.moderate,
    },
    {
      value: "aggressive",
      label: t("aggressive"),
      sub: t("aggressiveSub"),
      background: RISK_BACKGROUND.aggressive,
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-9">
      <TopBrand />
      <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.14em] text-amber-dim uppercase">
        {t("step")}
      </div>
      <div className="mb-9 max-w-xl text-center font-fraunces text-2xl font-semibold leading-snug">
        {t("question")}
      </div>
      <div className="mb-9 flex max-w-[640px] flex-wrap justify-center gap-4">
        {RISK_OPTIONS.map((opt) => (
          <OptionBox
            key={opt.value}
            testId={`risk-${opt.value}`}
            selected={risk === opt.value}
            onClick={() => setRisk(opt.value)}
            background={opt.background}
            className="w-[180px] min-h-16 flex-col gap-1.5"
          >
            <span>{opt.label}</span>
            <small className="font-mono text-[11px] font-normal opacity-80">
              {opt.sub}
            </small>
          </OptionBox>
        ))}
      </div>
      <NextButton disabled={risk === null} onClick={() => goTo("page4")}>
        {tc("nextPageButton")}
      </NextButton>
      <Disclaimer />
    </div>
  );
}
