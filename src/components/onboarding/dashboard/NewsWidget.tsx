"use client";

import { useTranslations } from "next-intl";
import { CollapsibleWidget } from "./CollapsibleWidget";
import newsData from "../../../../data/market-news.json";

interface NewsItem {
  title: string;
  source: string;
  date: string;
  description: string;
}

const items = (newsData as unknown as { items: NewsItem[] }).items;

const THUMBNAIL_COLORS = [
  "#5B7FA6",
  "#9C7A5B",
  "#6B8E7A",
  "#8E6B8E",
  "#A67C52",
];

export function getInitials(source: string): string {
  const words = source.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function getSourceColor(source: string): string {
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash + source.charCodeAt(i)) % THUMBNAIL_COLORS.length;
  }
  return THUMBNAIL_COLORS[hash];
}

export function NewsWidget({ revealed }: { revealed: boolean }) {
  const t = useTranslations("widgets");
  return (
    <CollapsibleWidget
      testId="widget-news"
      title={t("newsTitle")}
      positionClassName="left-1/2 bottom-0 w-[330px] -translate-x-1/2"
      revealed={revealed}
      totalRows={items.length}
      windowSize={5}
      scrollHintLabel={t("scrollHint", { shown: 5, total: items.length })}
      bodyHeightClassName="max-h-[300px]"
      renderRow={(index) => {
        const n = items[index];
        return (
          <div className="flex gap-2 border-b border-[#eee] px-3 py-2">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md font-sans text-[9px] font-bold text-white"
              style={{ background: getSourceColor(n.source) }}
              data-testid={`widget-news-thumb-${index}`}
            >
              {getInitials(n.source)}
            </div>
            <div className="flex flex-col gap-0.5">
              <b
                className="font-fraunces text-[10.5px]"
                data-testid={`widget-news-title-${index}`}
              >
                {n.title}
              </b>
              <p
                className="line-clamp-2 font-sans text-[9.5px] leading-snug text-[#555]"
                data-testid={`widget-news-description-${index}`}
              >
                {n.description}
              </p>
              <span className="font-mono text-[9.5px] text-[#777]">
                {n.source} · {n.date}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
