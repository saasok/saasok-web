"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore, LANGUAGES, type Language } from "@/store/onboarding";
import { trackEvent } from "@/lib/analytics";
import { BrandMark } from "../BrandMark";

interface GeoResult {
  country: string | null;
  isVpn: boolean;
}

async function fetchGeo(): Promise<GeoResult> {
  try {
    const res = await fetch("/api/geo");
    if (!res.ok) throw new Error("geo lookup failed");
    return (await res.json()) as GeoResult;
  } catch {
    return { country: null, isVpn: false };
  }
}

export function CoverPage() {
  const goTo = useOnboardingStore((s) => s.goTo);
  const setLanguage = useOnboardingStore((s) => s.setLanguage);
  const [show, setShow] = useState({
    tagline: false,
    brandmark: false,
    logo: false,
  });
  const [showLanguageGate, setShowLanguageGate] = useState(false);

  useEffect(() => {
    // The 3800ms advance timer starts immediately, exactly as before the geo
    // check was added — the geo fetch races against it rather than gating
    // it, so a slow/unreachable geo API never delays the common (non-VPN)
    // path by even a millisecond.
    let cancelled = false;
    const timers = [
      setTimeout(() => setShow((s) => ({ ...s, tagline: true })), 250),
      setTimeout(() => setShow((s) => ({ ...s, brandmark: true })), 900),
      setTimeout(() => setShow((s) => ({ ...s, logo: true })), 1150),
    ];
    const advanceTimer = setTimeout(() => goTo("page2"), 3800);

    fetchGeo().then((geo) => {
      if (cancelled) return;
      trackEvent("geo_lookup", { country: geo.country });
      if (geo.isVpn) {
        clearTimeout(advanceTimer);
        setShowLanguageGate(true);
      }
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(advanceTimer);
    };
  }, [goTo]);

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    goTo("page2");
  };

  if (showLanguageGate) {
    return <LanguageGate onSelect={handleLanguageSelect} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[22px]">
      <div
        className={`font-fraunces text-center text-[25px] font-medium italic transition-all duration-1000 ease-out ${
          show.tagline ? "translate-y-0 opacity-100" : "translate-y-3.5 opacity-0"
        }`}
      >
        Get your edge up by <span className="not-italic">SaaSok</span>
      </div>
      <div
        className={`transition-all duration-700 ${
          show.brandmark ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <BrandMark />
      </div>
      <div
        className={`font-fraunces text-[34px] font-semibold tracking-wide transition-all duration-700 ${
          show.logo ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        SaaS<em className="text-muted font-medium not-italic italic">ok</em>
      </div>
    </div>
  );
}

function LanguageGate({
  onSelect,
}: {
  onSelect: (language: Language) => void;
}) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 px-10"
      data-testid="language-gate"
    >
      <BrandMark />
      <p className="font-fraunces text-lg text-ivory">Choose your language</p>
      <div className="flex max-w-[320px] flex-wrap justify-center gap-2">
        {LANGUAGES.map((l) => (
          <button
            type="button"
            key={l.code}
            data-testid={`language-${l.code}`}
            onClick={() => onSelect(l.code)}
            className="rounded-md bg-silver px-3.5 py-2 font-mono text-[11px] font-semibold text-[#111] transition hover:bg-silver-hi"
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
