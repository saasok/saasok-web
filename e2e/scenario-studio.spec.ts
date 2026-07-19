import { test, expect, type Page } from "@playwright/test";

async function goToScenarioStudioPage(page: Page) {
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
}

test("selecting a scenario highlights the expected positions green/red/gray", async ({
  page,
}) => {
  await goToScenarioStudioPage(page);

  // "Inflation returns / stagflation" (index 2).
  await page.getByTestId("scen-card-2").click();

  await expect(page.getByTestId("scen-position-AAPL")).toHaveAttribute(
    "data-highlight",
    "green",
  );
  await expect(page.getByTestId("scen-position-TSLA")).toHaveAttribute(
    "data-highlight",
    "red",
  );
  await expect(page.getByTestId("scen-position-AMZN")).toHaveAttribute(
    "data-highlight",
    "gray",
  );
});

test("switching the horizon tab updates the selected scenario's copy and highlights", async ({
  page,
}) => {
  await goToScenarioStudioPage(page);

  // "AI performance supercycle" (index 0): AAPL green / NVDA gray at 5yr,
  // flips to AAPL gray / NVDA green at 10yr.
  await page.getByTestId("scen-card-0").click();
  await expect(page.getByTestId("scen-detail-title")).toContainText(
    "5 years",
  );
  await expect(page.getByTestId("scen-position-AAPL")).toHaveAttribute(
    "data-highlight",
    "green",
  );

  await page.getByTestId("scen-horizon-10").click();

  await expect(page.getByTestId("scen-detail-title")).toContainText(
    "10 years",
  );
  await expect(page.getByTestId("scen-position-AAPL")).toHaveAttribute(
    "data-highlight",
    "gray",
  );
  await expect(page.getByTestId("scen-position-NVDA")).toHaveAttribute(
    "data-highlight",
    "green",
  );
});

test("reset clears all highlighting and restores the placeholder detail copy", async ({
  page,
}) => {
  await goToScenarioStudioPage(page);

  await page.getByTestId("scen-card-2").click();
  await expect(page.getByTestId("scen-position-AAPL")).toHaveAttribute(
    "data-highlight",
    "green",
  );

  await page.getByTestId("scen-reset").click();

  await expect(page.getByTestId("scen-position-AAPL")).toHaveAttribute(
    "data-highlight",
    "none",
  );
  await expect(page.getByText("Pick a scenario")).toBeVisible();
});
