"use client";

import type { CSSProperties, ReactNode } from "react";

export function OptionBox({
  selected,
  onClick,
  background,
  className = "",
  children,
  testId,
}: {
  selected: boolean;
  onClick: () => void;
  background: string;
  className?: string;
  children: ReactNode;
  testId?: string;
}) {
  const style: CSSProperties = { background };
  return (
    <div
      role="button"
      aria-pressed={selected}
      data-testid={testId}
      onClick={onClick}
      style={style}
      className={`opt-box relative flex min-h-[68px] cursor-pointer items-center justify-center rounded-[9px] border-[1.5px] border-white/[0.08] px-3.5 py-5 text-center font-sans text-[13.5px] font-semibold tracking-wide text-ivory transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-white/20 ${
        selected
          ? "border-amber shadow-[0_0_0_1px_var(--amber)_inset,0_6px_18px_rgba(214,176,76,0.18)]"
          : ""
      } ${className}`}
    >
      {selected && (
        <span className="absolute top-1.5 right-2 text-[10px] text-amber">
          ✓
        </span>
      )}
      {children}
    </div>
  );
}
