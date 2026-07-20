import enMessages from "./en.json";

// Every locale is loaded from a checked-in dictionary the app owns, so a
// missing key is always a translation gap, never untrusted input — falling
// back to the English string (instead of next-intl's default of showing the
// raw dotted key) keeps the UI readable even when a locale's copy lags.
export function resolveEnglishFallback(
  namespace: string | undefined,
  key: string,
): string {
  const path = [...(namespace ? namespace.split(".") : []), ...key.split(".")];
  let node: unknown = enMessages;
  for (const segment of path) {
    if (node && typeof node === "object" && segment in node) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }
  return typeof node === "string" ? node : key;
}
