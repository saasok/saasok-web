import { test, expect, type Page } from "@playwright/test";
import en from "../src/messages/en.json";
import de from "../src/messages/de.json";
import fr from "../src/messages/fr.json";
import it from "../src/messages/it.json";

const DICTS = { en, de, fr, it } as const;
type LocaleCode = keyof typeof DICTS;
const LOCALES: LocaleCode[] = ["en", "de", "fr", "it"];

// Any leaked-key regression would render as "namespace.key" verbatim — this
// matches that shape for every namespace actually used by the app, so a
// false positive would require real prose to accidentally look like a
// dotted i18n key from one of these exact namespaces.
const NAMESPACES = Object.keys(en).join("|");
const RAW_KEY_PATTERN = new RegExp(`\\b(${NAMESPACES})\\.[a-zA-Z][a-zA-Z0-9]*\\b`);

async function assertNoRawKeys(page: Page) {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(RAW_KEY_PATTERN);
}

// Forces the VPN gate deterministically (mirrors the fetchGeo mocking
// pattern already used in CoverPage.test.tsx) so every locale is reachable
// without depending on the real geo/VPN APIs.
async function mockVpnGeo(page: Page) {
  await page.route("**/api/geo", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ country: "Germany", isVpn: true }),
    }),
  );
}

async function walkOnboardingThroughClosing(page: Page, locale: LocaleCode) {
  const t = DICTS[locale];

  await mockVpnGeo(page);
  await page.goto("/");

  await page.getByTestId(`language-${locale}`).click();
  await expect(page.getByText(t.brokers.question)).toBeVisible({
    timeout: 6000,
  });
  await assertNoRawKeys(page);

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page.getByRole("button", { name: t.common.nextPageButton }).click();

  await expect(page.getByText(t.risk.question)).toBeVisible();
  await page.getByTestId("risk-moderate").click();
  await page.getByRole("button", { name: t.common.nextPageButton }).click();

  await expect(page.getByText(t.years.question)).toBeVisible();
  await page.getByTestId("years-5-9").click();
  await page.getByRole("button", { name: t.years.next }).click();

  await expect(page.getByText(t.dashboard.title)).toBeVisible({
    timeout: 6000,
  });
  await expect(page.getByTestId("disclaimer")).toHaveText(t.disclaimer.body);
  await assertNoRawKeys(page);
  await page.getByTestId("dashboard-next-arrow").click();

  await expect(page.getByText(t.competitiveAsset.title)).toBeVisible();
  await assertNoRawKeys(page);
  await page.getByTestId("competitive-next-arrow").click();

  await expect(page.getByText(t.correlation.title)).toBeVisible();
  await assertNoRawKeys(page);
  await page.getByTestId("corr-next-arrow").click();

  await expect(page.getByText(t.taxInsights.title)).toBeVisible();
  await assertNoRawKeys(page);
  await page.getByTestId("tax-next-arrow").click();

  await expect(page.getByText(t.scenarioStudio.title)).toBeVisible();
  await assertNoRawKeys(page);
  await page.getByTestId("scen-next-arrow").click();

  await expect(page.getByText(t.closing.tagline)).toBeVisible();
  await assertNoRawKeys(page);
}

for (const locale of LOCALES) {
  test(`onboarding through closing renders fully translated copy in ${locale}`, async ({
    page,
  }) => {
    await walkOnboardingThroughClosing(page, locale);
  });
}

test("selecting a language sets <html lang> and persists across pages", async ({
  page,
}) => {
  await mockVpnGeo(page);
  await page.goto("/");

  await page.getByTestId("language-fr").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page
    .getByRole("button", { name: fr.common.nextPageButton })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
