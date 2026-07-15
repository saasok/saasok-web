import { create } from "zustand";

export const PAGE_ORDER = [
  "page1",
  "page2",
  "page3",
  "page4",
  "pageLoad",
  "page5",
  "page6",
  "page7",
  "page8",
  "page9",
  "page10",
] as const;

export type PageId = (typeof PAGE_ORDER)[number];

export type Risk = "conservative" | "moderate" | "aggressive";
export type Years = "1-4" | "5-9" | "10+";

export const BROKERS = [
  "INTERACTIVE BROKERS (IBKR)",
  "SAXO",
  "WIO",
  "XTB",
  "SWISSQUOTE",
  "EXANTE",
] as const;

export const MAX_BROKERS = 3;

interface OnboardingState {
  page: PageId;
  maxPageIndex: number;
  brokers: string[];
  risk: Risk | null;
  years: Years | null;
  toggleBroker: (broker: string) => void;
  setRisk: (risk: Risk) => void;
  setYears: (years: Years) => void;
  goTo: (page: PageId) => void;
  goBack: (page: PageId) => void;
  reset: () => void;
}

const initial = {
  page: "page1" as PageId,
  maxPageIndex: 0,
  brokers: [] as string[],
  risk: null as Risk | null,
  years: null as Years | null,
};

declare global {
  interface Window {
    __onboardingState?: {
      page: PageId;
      brokers: string[];
      risk: Risk | null;
      years: Years | null;
    };
  }
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initial,

  toggleBroker: (broker) =>
    set((state) => {
      const idx = state.brokers.indexOf(broker);
      if (idx > -1) {
        return { brokers: state.brokers.filter((b) => b !== broker) };
      }
      if (state.brokers.length >= MAX_BROKERS) return {};
      return { brokers: [...state.brokers, broker] };
    }),

  setRisk: (risk) => set({ risk }),

  setYears: (years) => set({ years }),

  goTo: (page) => {
    const targetIndex = PAGE_ORDER.indexOf(page);
    if (targetIndex < get().maxPageIndex) return;
    set({ page, maxPageIndex: Math.max(targetIndex, get().maxPageIndex) });
  },

  // Explicit escape hatch for the Competitive Asset View's back arrow only:
  // moves to an already-visited page without touching maxPageIndex, so the
  // forward guard (and the browser back/forward lock) stay intact everywhere
  // else.
  goBack: (page) => set({ page }),

  reset: () => set({ ...initial }),
}));

// Exposes a read-only snapshot for e2e assertions; the app itself never reads this.
if (typeof window !== "undefined") {
  useOnboardingStore.subscribe((state) => {
    window.__onboardingState = {
      page: state.page,
      brokers: state.brokers,
      risk: state.risk,
      years: state.years,
    };
  });
}
