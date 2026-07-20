import { create } from "zustand";
import { trackEvent } from "@/lib/analytics";

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

export type Residency = "EU" | "UK" | "US" | "UAE" | "CH" | "UA";
export const RESIDENCIES: Residency[] = ["EU", "UK", "US", "UAE", "CH", "UA"];

export type Language = "en" | "de" | "fr" | "it";
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

const RESIDENCY_STORAGE_KEY = "saasok:residency";
const LANGUAGE_STORAGE_KEY = "saasok:language";

function isResidency(v: string | null): v is Residency {
  return v !== null && (RESIDENCIES as readonly string[]).includes(v);
}

function isLanguage(v: string | null): v is Language {
  return v !== null && LANGUAGES.some((l) => l.code === v);
}

// Residency is the one onboarding field that must survive a real browser
// reload within the same tab session (unlike page/brokers/risk/years, which
// are in-memory only and reset to page1 on refresh) — sessionStorage is used
// here and nowhere else in the app.
function readStoredResidency(): Residency | null {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(RESIDENCY_STORAGE_KEY);
  return isResidency(v) ? v : null;
}
function writeStoredResidency(r: Residency) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(RESIDENCY_STORAGE_KEY, r);
  }
}
function clearStoredResidency() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RESIDENCY_STORAGE_KEY);
  }
}

// language mirrors residency's reload-survives-within-tab persistence, since
// both are user choices made mid-flow that shouldn't reset on an accidental
// refresh (unlike page/brokers/risk/years, which are in-memory only).
function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(v) ? v : null;
}
function writeStoredLanguage(l: Language) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, l);
  }
}
function clearStoredLanguage() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(LANGUAGE_STORAGE_KEY);
  }
}

interface OnboardingState {
  page: PageId;
  maxPageIndex: number;
  brokers: string[];
  risk: Risk | null;
  years: Years | null;
  residency: Residency | null;
  language: Language;
  toggleBroker: (broker: string) => void;
  setRisk: (risk: Risk) => void;
  setYears: (years: Years) => void;
  setResidency: (residency: Residency) => void;
  setLanguage: (language: Language) => void;
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
  residency: readStoredResidency(),
  language: (readStoredLanguage() ?? "en") as Language,
};

declare global {
  interface Window {
    __onboardingState?: {
      page: PageId;
      brokers: string[];
      risk: Risk | null;
      years: Years | null;
      residency: Residency | null;
      language: Language;
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

  // Ratchet like the goTo forward guard: once set, further calls are a no-op
  // — this is the "no going back" rule applied to residency.
  setResidency: (residency) => {
    if (get().residency) return;
    writeStoredResidency(residency);
    set({ residency });
    trackEvent("residency_selected", { residency });
  },

  setLanguage: (language) => {
    writeStoredLanguage(language);
    set({ language });
    trackEvent("language_selected", { language, source: "vpn_gate" });
  },

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

  // Explicitly clears storage and nulls residency rather than reusing the
  // module-load-time `initial` object, whose residency field was only ever
  // read once.
  reset: () => {
    clearStoredResidency();
    clearStoredLanguage();
    set({ ...initial, residency: null, language: "en" });
  },
}));

// Exposes a read-only snapshot for e2e assertions; the app itself never reads this.
if (typeof window !== "undefined") {
  useOnboardingStore.subscribe((state) => {
    window.__onboardingState = {
      page: state.page,
      brokers: state.brokers,
      risk: state.risk,
      years: state.years,
      residency: state.residency,
      language: state.language,
    };
  });
}
