"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { useHoverDuration } from "@/hooks/useHoverDuration";
import { trackEvent } from "@/lib/analytics";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface CollapsibleWidgetProps {
  testId: string;
  title: string;
  positionClassName: string;
  revealed: boolean;
  totalRows: number;
  windowSize?: number;
  scrollHintLabel: string;
  bodyHeightClassName?: string;
  renderRow: (index: number) => ReactNode;
}

export function CollapsibleWidget({
  testId,
  title,
  positionClassName,
  revealed,
  totalRows,
  windowSize = 10,
  scrollHintLabel,
  bodyHeightClassName = "max-h-[220px]",
  renderRow,
}: CollapsibleWidgetProps) {
  const t = useTranslations("widgets");
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const { onMouseEnter, onMouseLeave } = useHoverDuration(testId);
  const bodyRef = useRef<HTMLDivElement>(null);

  const maxStart = Math.max(0, totalRows - windowSize);

  const step = useCallback(
    (delta: number) => {
      setStartIndex((i) => {
        const next = clamp(i + delta, 0, maxStart);
        if (next !== i && maxStart > 0) {
          trackEvent("widget_scroll", {
            widget: testId,
            depth_pct: Math.round((next / maxStart) * 100),
          });
        }
        return next;
      });
    },
    [maxStart, testId],
  );

  const handleHeaderClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("wclose")) {
      setOpen(false);
      return;
    }
    setOpen((o) => !o);
  };

  // React's synthetic onWheel is attached as a passive listener, so
  // preventDefault() there is a silent no-op and the page would also
  // natively scroll underneath the widget. A real (non-passive) listener
  // is required to make the wheel act only as the window-stepper.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      step(Math.sign(e.deltaY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open, step]);

  const visibleCount = Math.min(windowSize, totalRows);
  const visibleIndices = Array.from(
    { length: visibleCount },
    (_, k) => startIndex + k,
  );

  return (
    <div
      className={`absolute rounded-[10px] bg-silver text-[#151515] shadow-[0_10px_26px_rgba(0,0,0,0.3)] transition-opacity duration-500 ${revealed ? "opacity-100" : "opacity-0"} ${open ? "shadow-[0_16px_34px_rgba(0,0,0,0.42)]" : ""} ${positionClassName}`}
      data-testid={testId}
      data-open={open}
      data-revealed={revealed}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="widget-head flex cursor-pointer items-center justify-between px-3.5 py-2.5 font-fraunces text-[12.5px] font-semibold tracking-[0.01em]"
        data-testid={`${testId}-header`}
        onClick={handleHeaderClick}
      >
        <span>{title}</span>
        <span
          className="wclose text-[12px] font-bold text-red"
          data-testid={`${testId}-close`}
        >
          &#10005;
        </span>
      </div>
      {open && (
        <div
          ref={bodyRef}
          className={`${bodyHeightClassName} overflow-hidden bg-white`}
          data-testid={`${testId}-body`}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-[#eee] bg-white px-2 py-0.5 font-mono text-[9px] text-[#999]">
            <span>{scrollHintLabel}</span>
            <span className="flex flex-col leading-none">
              <button
                type="button"
                aria-label={t("scrollUpAria")}
                data-testid={`${testId}-scroll-up`}
                className="disabled:opacity-30"
                disabled={startIndex <= 0}
                onClick={() => step(-1)}
              >
                &#9650;
              </button>
              <button
                type="button"
                aria-label={t("scrollDownAria")}
                data-testid={`${testId}-scroll-down`}
                className="disabled:opacity-30"
                disabled={startIndex >= maxStart}
                onClick={() => step(1)}
              >
                &#9660;
              </button>
            </span>
          </div>
          {visibleIndices.map((i) => (
            <div key={i} data-testid={`${testId}-row-${i}`}>
              {renderRow(i)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
