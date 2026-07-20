import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { IntlProvider } from "@/components/IntlProvider";

// Every page component now calls useTranslations(), which throws without a
// NextIntlClientProvider ancestor — this wraps renders with the app's real
// provider (locale comes from the onboarding store, same as production) so
// existing tests don't need to hand-roll message mocks.
export function renderWithIntl(ui: ReactElement): RenderResult {
  return render(<IntlProvider>{ui}</IntlProvider>);
}
