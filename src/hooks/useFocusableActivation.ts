import { useEffect } from "react";

export const FOCUSABLE_SELECTOR =
  ".opt-box,.exch,.widget-head,.corr-node,.res-opt,.asset-item,.scen-card,.htab,.arrow,.tax-close,.wclose,.cal-close,.corr-reset";

function makeFocusable(root: ParentNode) {
  root.querySelectorAll(FOCUSABLE_SELECTOR).forEach((el) => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  });
}

export function useFocusableActivation(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    makeFocusable(root);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target as Element;
      if (target.matches && target.matches(FOCUSABLE_SELECTOR)) {
        e.preventDefault();
        (target as HTMLElement).click();
      }
    };
    root.addEventListener("keydown", onKeyDown);

    const observer = new MutationObserver(() => makeFocusable(root));
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      root.removeEventListener("keydown", onKeyDown);
      observer.disconnect();
    };
  }, [containerRef]);
}
