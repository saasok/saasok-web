import { useEffect, useRef } from "react";
import type { PageId } from "@/store/onboarding";

/**
 * Locks the browser back/forward buttons to the current step. Every forward
 * page change pushes a history entry; any popstate (back or forward chrome
 * button) is immediately cancelled by re-pushing the current page's entry,
 * so the wizard can never be rewound once a page has been left.
 */
export function useBackNavigationLock(page: PageId) {
  const pageRef = useRef(page);
  const initialized = useRef(false);

  useEffect(() => {
    pageRef.current = page;
    if (!initialized.current) {
      initialized.current = true;
      window.history.replaceState({ page }, "", window.location.href);
      return;
    }
    window.history.pushState({ page }, "", window.location.href);
  }, [page]);

  useEffect(() => {
    const onPopState = () => {
      window.history.pushState(
        { page: pageRef.current },
        "",
        window.location.href,
      );
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
