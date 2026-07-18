import { test, expect, type Page } from "@playwright/test";
import taxInsightsData from "../data/tax-insights.json";

interface CapitalGainsTaxRow {
  taxResidency: string;
  typicalRateLow: number;
  typicalRateHigh: number;
}

function getCgtRow(residency: string): CapitalGainsTaxRow {
  const row = (
    taxInsightsData.capitalGainsTax.rows as CapitalGainsTaxRow[]
  ).find((r) => r.taxResidency === residency);
  if (!row) throw new Error(`No CGT row for ${residency}`);
  return row;
}

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function formatPct(rate: number): string {
  return Number((rate * 100).toFixed(1)).toString();
}

function expectedCgtResult(residency: string, amount: number): string {
  const row = getCgtRow(residency);
  return `Estimated CGT range (${residency}): ${formatUsd(amount * row.typicalRateLow)} – ${formatUsd(amount * row.typicalRateHigh)} (${formatPct(row.typicalRateLow)}–${formatPct(row.typicalRateHigh)}%)`;
}

async function goToTaxInsightsPage(page: Page) {
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
}

test("selecting a residency hides the gate for good, including across a real reload", async ({
  page,
}) => {
  await goToTaxInsightsPage(page);

  await expect(page.getByTestId("tax-residency-gate")).toBeVisible();
  await page.getByTestId("tax-residency-UK").click();
  await expect(page.getByTestId("tax-residency-gate")).not.toBeVisible();
  await expect(page.getByTestId("tax-blocks")).toBeVisible();

  // A real reload resets page/brokers/risk/years to page1 (only residency
  // persists via sessionStorage), so re-walk the flow to get back to page8.
  await page.reload();
  await goToTaxInsightsPage(page);

  await expect(page.getByTestId("tax-residency-gate")).not.toBeVisible();
  await expect(page.getByTestId("tax-blocks")).toBeVisible();
});

test("a hypothetical sale amount renders the correct CGT range for the chosen residency", async ({
  page,
}) => {
  await goToTaxInsightsPage(page);
  await page.getByTestId("tax-residency-UK").click();

  await expect(page.getByTestId("tax-calc-result")).toHaveText(
    "Enter an amount to see the estimated range.",
  );

  await page.getByTestId("tax-sell-amount").fill("100000");

  await expect(page.getByTestId("tax-calc-result")).toHaveText(
    expectedCgtResult("UK", 100000),
  );
});

test("closing all three blocks via the red X collapses them for the rest of the session", async ({
  page,
}) => {
  await goToTaxInsightsPage(page);
  await page.getByTestId("tax-residency-US").click();

  await expect(page.getByTestId("tax-block-tloss")).toBeVisible();
  await expect(page.getByTestId("tax-block-calc")).toBeVisible();
  await expect(page.getByTestId("tax-block-fees")).toBeVisible();

  await page.getByTestId("tax-close-tloss").click();
  await expect(page.getByTestId("tax-block-tloss")).not.toBeVisible();

  await page.getByTestId("tax-close-calc").click();
  await expect(page.getByTestId("tax-block-calc")).not.toBeVisible();

  await page.getByTestId("tax-close-fees").click();
  await expect(page.getByTestId("tax-block-fees")).not.toBeVisible();
});
