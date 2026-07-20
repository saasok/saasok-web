"use client";

import { useEffect } from "react";
import { IntlErrorCode, NextIntlClientProvider, type IntlError } from "next-intl";
import { useOnboardingStore } from "@/store/onboarding";
import { resolveEnglishFallback } from "@/messages/resolveFallback";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";
import frMessages from "@/messages/fr.json";
import itMessages from "@/messages/it.json";

const MESSAGES = {
  en: enMessages,
  de: deMessages,
  fr: frMessages,
  it: itMessages,
} as const;

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const language = useOnboardingStore((s) => s.language);

  // layout.tsx renders a static `lang="en"` on the server, before hydration
  // knows the selected locale — this keeps it in sync on the client.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <NextIntlClientProvider
      locale={language}
      messages={MESSAGES[language]}
      timeZone="UTC"
      onError={(error: IntlError) => {
        if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
          console.error(error);
        }
      }}
      getMessageFallback={({ namespace, key }) =>
        resolveEnglishFallback(namespace, key)
      }
    >
      {children}
    </NextIntlClientProvider>
  );
}
