"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { BrandMark } from "../BrandMark";

export function CoverPage() {
  const goTo = useOnboardingStore((s) => s.goTo);
  const [show, setShow] = useState({
    tagline: false,
    brandmark: false,
    logo: false,
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setShow((s) => ({ ...s, tagline: true })), 250),
      setTimeout(() => setShow((s) => ({ ...s, brandmark: true })), 900),
      setTimeout(() => setShow((s) => ({ ...s, logo: true })), 1150),
      setTimeout(() => goTo("page2"), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [goTo]);

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
