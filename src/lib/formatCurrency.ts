import type { Language } from "@/store/onboarding";

// Currency stays USD across all locales (the product is US-dollar
// denominated regardless of language) — only grouping/decimal conventions
// adapt per locale, e.g. "$12,345" (en) vs "12.345 $" (de).
export function formatCurrency(value: number, locale: Language): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
