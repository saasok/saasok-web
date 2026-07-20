import en from "./en.json";
import de from "./de.json";
import fr from "./fr.json";
import itMessages from "./it.json";
import { resolveEnglishFallback } from "./resolveFallback";

function collectKeyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    collectKeyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("message dictionary parity", () => {
  const enKeys = collectKeyPaths(en).sort();
  const locales: [string, unknown][] = [
    ["de", de],
    ["fr", fr],
    ["it", itMessages],
  ];

  it.each(locales)(
    "%s has the exact same key set as en.json",
    (_locale, dict) => {
      expect(collectKeyPaths(dict).sort()).toEqual(enKeys);
    },
  );
});

describe("missing-key fallback", () => {
  it("resolves an existing key straight from the English dictionary", () => {
    expect(resolveEnglishFallback("brokers", "question")).toBe(
      en.brokers.question,
    );
  });

  it("falls back to the English string, never a raw dotted key, when a key is missing from a locale", () => {
    // Simulates next-intl's getMessageFallback being invoked for a key that
    // doesn't exist in the active locale's dictionary but does in English.
    const fallback = resolveEnglishFallback("closing", "restart");
    expect(fallback).toBe(en.closing.restart);
    expect(fallback).not.toBe("closing.restart");
  });

  it("returns the raw key only in the (should-never-happen) case where English itself lacks the key", () => {
    expect(resolveEnglishFallback("brokers", "thisKeyDoesNotExist")).toBe(
      "thisKeyDoesNotExist",
    );
  });
});

describe("disclaimer legal-review parity flag", () => {
  const locales: [string, typeof de][] = [
    ["de", de],
    ["fr", fr],
    ["it", itMessages],
  ];

  it.each(locales)(
    "%s disclaimer.pendingLegalReview is true only while its body still matches the English placeholder verbatim",
    (_locale, dict) => {
      // Ships the English legal text as a flagged placeholder for de/fr/it
      // (never auto-translated) — this fails the moment someone edits the
      // body without clearing the flag, or clears the flag without a real,
      // reviewed translation actually landing.
      const bodyMatchesEnglish = dict.disclaimer.body === en.disclaimer.body;
      expect(dict.disclaimer.pendingLegalReview).toBe(bodyMatchesEnglish);
    },
  );

  it("en.json's disclaimer.pendingLegalReview is false (English is the source of truth, never pending)", () => {
    expect(en.disclaimer.pendingLegalReview).toBe(false);
  });
});
