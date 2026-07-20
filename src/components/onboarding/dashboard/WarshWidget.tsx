"use client";

import { useTranslations } from "next-intl";
import { CollapsibleWidget } from "./CollapsibleWidget";
import warshData from "../../../../data/warsh-speeches.json";

interface WarshTalk {
  date: string;
  topic: string;
  location: string;
}

const talks = (warshData as unknown as { talks: WarshTalk[] }).talks;

export function WarshWidget({ revealed }: { revealed: boolean }) {
  const t = useTranslations("widgets");
  return (
    <CollapsibleWidget
      testId="widget-warsh"
      title={t("warshTitle")}
      positionClassName="right-0 bottom-0 w-[280px]"
      revealed={revealed}
      totalRows={talks.length}
      scrollHintLabel={t("scrollHintWarsh")}
      renderRow={(index) => {
        const t = talks[index];
        return (
          <div
            className="grid grid-cols-[64px_1fr_auto] items-center gap-2 border-b border-[#eee] px-2.5 py-1.5 font-mono text-[10px]"
            data-testid={`widget-warsh-row-${t.date}`}
          >
            <span data-testid={`widget-warsh-date-${t.date}`}>{t.date}</span>
            <span data-testid={`widget-warsh-topic-${t.date}`}>{t.topic}</span>
            <span
              className="font-sans text-[9.5px] text-[#888]"
              data-testid={`widget-warsh-location-${t.date}`}
            >
              {t.location}
            </span>
          </div>
        );
      }}
    />
  );
}
