"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useOnboardingStore } from "@/store/onboarding";

const LOADING_DELAY_MS = 3000;

export function LoadingPage() {
  const goTo = useOnboardingStore((s) => s.goTo);
  const t = useTranslations("loading");

  useEffect(() => {
    const timer = setTimeout(() => goTo("page5"), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [goTo]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="h-[30px] w-[30px] animate-spin rounded-full border-[2.5px] border-white/[0.12] border-t-amber" />
      <div className="font-mono text-[13px] tracking-wide text-muted">
        {t("message")}
      </div>
    </div>
  );
}
