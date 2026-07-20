"use client";

import { useTranslations } from "next-intl";

export function Disclaimer() {
  const t = useTranslations("disclaimer");
  return (
    <div
      className="pointer-events-none absolute bottom-3 left-0 right-0 px-[70px] text-center text-[9px] leading-relaxed text-muted-dim"
      data-testid="disclaimer"
    >
      {t("body")}
    </div>
  );
}
