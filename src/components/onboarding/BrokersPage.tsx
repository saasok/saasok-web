"use client";

import { useTranslations } from "next-intl";
import { BROKERS, useOnboardingStore } from "@/store/onboarding";
import { TopBrand } from "../BrandMark";
import { Disclaimer } from "../Disclaimer";
import { NextButton } from "./NextButton";
import { OptionBox } from "./OptionBox";

const BROKER_META: Record<
  (typeof BROKERS)[number],
  { label: string; background: string }
> = {
  "INTERACTIVE BROKERS (IBKR)": {
    label: "IBKR",
    background: "linear-gradient(160deg,#C23B22,#9E2E19)",
  },
  SAXO: {
    label: "Saxo Bank",
    background: "linear-gradient(160deg,#122A52,#0A1A36)",
  },
  WIO: {
    label: "Wio",
    background: "linear-gradient(160deg,#00A19A,#017871)",
  },
  XTB: {
    label: "XTB",
    background: "linear-gradient(160deg,#0057B7,#003E85)",
  },
  SWISSQUOTE: {
    label: "Swissquote",
    background: "linear-gradient(160deg,#E30613,#A80510)",
  },
  EXANTE: {
    label: "Exante",
    background: "linear-gradient(160deg,#1c1c1c,#0a0a0a)",
  },
};

export function BrokersPage() {
  const brokers = useOnboardingStore((s) => s.brokers);
  const toggleBroker = useOnboardingStore((s) => s.toggleBroker);
  const goTo = useOnboardingStore((s) => s.goTo);
  const t = useTranslations("brokers");
  const tc = useTranslations("common");

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-9">
      <TopBrand />
      <div className="mb-2.5 font-mono text-[10.5px] tracking-[0.14em] text-amber-dim uppercase">
        {t("step")}
      </div>
      <div className="mb-9 max-w-xl text-center font-fraunces text-2xl font-semibold leading-snug">
        {t("question")}
        <small className="mt-2 block font-sans text-xs font-normal text-muted">
          {t("hint")}
        </small>
      </div>
      <div className="mb-9 grid grid-cols-3 gap-3.5">
        {BROKERS.map((broker) => (
          <OptionBox
            key={broker}
            testId={`broker-${broker}`}
            selected={brokers.includes(broker)}
            onClick={() => toggleBroker(broker)}
            background={BROKER_META[broker].background}
            className="w-[152px]"
          >
            {BROKER_META[broker].label}
          </OptionBox>
        ))}
      </div>
      <NextButton disabled={brokers.length === 0} onClick={() => goTo("page3")}>
        {tc("nextPageButton")}
      </NextButton>
      <Disclaimer />
    </div>
  );
}
