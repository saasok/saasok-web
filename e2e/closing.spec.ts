import { test, expect, type Page } from "@playwright/test";

async function goToClosingPage(page: Page) {
  await page.goto("/");
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page.getByRole("button", { name: "Next page" }).click();

  await page.getByTestId("risk-moderate").click();
  await page.getByRole("button", { name: "Next page" }).click();

  await page.getByTestId("years-5-9").click();
  await page
    .getByRole("button", { name: "Consolidate your portfolio" })
    .click();

  await expect(page.getByText("Unified Portfolio Dashboard")).toBeVisible({
    timeout: 6000,
  });
  await page.getByTestId("dashboard-next-arrow").click();

  await expect(page.getByText("Competitive Asset View")).toBeVisible();
  await page.getByTestId("competitive-next-arrow").click();

  await expect(
    page.getByText("Correlation Analysis of your investments"),
  ).toBeVisible();
  await page.getByTestId("corr-next-arrow").click();

  await expect(
    page.getByText("Tax insights for your portfolio"),
  ).toBeVisible();
  await page.getByTestId("tax-next-arrow").click();

  await expect(
    page.getByText("Situational Studio for your future portfolio"),
  ).toBeVisible();
  await page.getByTestId("scen-next-arrow").click();

  await expect(
    page.getByText("Now you are edged up by SaaSok!"),
  ).toBeVisible();
}

test("restarting from the closing screen clears all state and replays onboarding back to page 2", async ({
  page,
}) => {
  await goToClosingPage(page);

  await page.getByTestId("closing-restart").click();

  // The collapse animation delays the actual reset by ~900ms; once it lands,
  // the store is fully cleared and the cover-page intro is playing again.
  await expect
    .poll(
      async () =>
        page.evaluate(() => window.__onboardingState?.brokers.length),
      { timeout: 3000 },
    )
    .toBe(0);
  const stateAfterRestart = await page.evaluate(() => window.__onboardingState);
  expect(stateAfterRestart?.risk).toBeNull();
  expect(stateAfterRestart?.years).toBeNull();
  expect(stateAfterRestart?.page).toBe("page1");

  // Intro auto-advances to page2 ~3.8s after landing on page1.
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });
  await expect
    .poll(async () => page.evaluate(() => window.__onboardingState?.page))
    .toBe("page2");

  // Onboarding is fully re-completable — no stale broker selection remains.
  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await expect
    .poll(async () => page.evaluate(() => window.__onboardingState?.brokers))
    .toEqual(["INTERACTIVE BROKERS (IBKR)"]);
});
