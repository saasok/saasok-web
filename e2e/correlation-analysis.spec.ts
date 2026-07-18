import { test, expect } from "@playwright/test";
import { COMPETITIVE_ASSETS } from "../src/lib/competitiveAssets";

const TICKERS = COMPETITIVE_ASSETS.map((a) => a.ticker);

async function goToCorrelationAnalysisPage(page: import("@playwright/test").Page) {
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
}

test("default layout shows all 20 assets with none centered", async ({
  page,
}) => {
  await goToCorrelationAnalysisPage(page);

  for (const ticker of TICKERS) {
    await expect(page.getByTestId(`corr-node-${ticker}`)).toHaveAttribute(
      "data-center",
      "false",
    );
  }
  await expect(page.getByTestId("corr-reset")).not.toBeVisible();
});

test("clicking an asset centers it and shows percentage labels on the rest, reset restores the layout", async ({
  page,
}) => {
  await goToCorrelationAnalysisPage(page);

  await page.getByTestId("corr-node-NVDA").click();

  await expect(page.getByTestId("corr-node-NVDA")).toHaveAttribute(
    "data-center",
    "true",
  );

  for (const ticker of TICKERS.filter((t) => t !== "NVDA")) {
    const pct = page.getByTestId(`corr-pct-${ticker}`);
    await expect(pct).toBeVisible();
    await expect(pct).toHaveText(/^\d+%$/);
  }

  await page.getByTestId("corr-reset").click();

  await expect(page.getByTestId("corr-node-NVDA")).toHaveAttribute(
    "data-center",
    "false",
  );
  await expect(page.getByTestId("corr-reset")).not.toBeVisible();
  await expect(page.getByTestId("corr-pct-AVGO")).not.toBeVisible();
});

test("left arrow returns to page 6 and right arrow advances to the next placeholder page", async ({
  page,
}) => {
  await goToCorrelationAnalysisPage(page);

  await page.getByTestId("corr-prev-arrow").click();
  await expect(page.getByText("Competitive Asset View")).toBeVisible();

  await page.getByTestId("competitive-next-arrow").click();
  await expect(
    page.getByText("Correlation Analysis of your investments"),
  ).toBeVisible();

  await page.getByTestId("corr-next-arrow").click();
  await expect(
    page.getByText("Tax insights for your portfolio"),
  ).toBeVisible();
});
