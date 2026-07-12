/**
 * Stub for the hidden analytics collection described in the TZ. Wire this up
 * to a real provider (GA4/Plausible) in Session 9 — for now it just logs.
 */
export function trackEvent(name: string, payload: Record<string, unknown>) {
  console.log("[analytics]", name, payload);
}
