"use client";

import { Component, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallbackTestId?: string;
}

interface State {
  hasError: boolean;
}

// React error boundaries must be class components (no hook equivalent) —
// wraps each page in App.tsx individually so a crash in one page's tree
// (e.g. a Recharts widget) shows a scoped fallback instead of a blank SPA.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    trackEvent("page_error", { message: error.message });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback testId={this.props.fallbackTestId} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ testId }: { testId?: string }) {
  const t = useTranslations("errorBoundary");
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center text-ivory"
      data-testid={testId ?? "error-boundary-fallback"}
    >
      <p className="font-fraunces text-lg">{t("title")}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-silver px-4 py-2 font-mono text-[11px] font-semibold text-[#111] transition hover:bg-silver-hi"
      >
        {t("reload")}
      </button>
    </div>
  );
}
