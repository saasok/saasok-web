import { useCallback, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Times how long the pointer stays over a widget and reports it as a
 * `widget_hover` event on mouse-out, per the TZ's hidden-analytics section.
 */
export function useHoverDuration(widget: string) {
  const enteredAt = useRef<number | null>(null);

  const onMouseEnter = useCallback(() => {
    enteredAt.current = Date.now();
  }, []);

  const onMouseLeave = useCallback(() => {
    if (enteredAt.current === null) return;
    const duration_seconds = (Date.now() - enteredAt.current) / 1000;
    trackEvent("widget_hover", { widget, duration_seconds });
    enteredAt.current = null;
  }, [widget]);

  return { onMouseEnter, onMouseLeave };
}
