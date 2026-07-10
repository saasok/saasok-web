import { test, expect } from "@playwright/test";
import { getPortfolio, getSectorBreakdown } from "../src/lib/portfolio";

function formatUsd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

test("dashboard shows the merged portfolio total for a specific selection", async ({
  page,
}) => {
  const brokers = ["INTERACTIVE BROKERS (IBKR)", "SAXO"] as const;
  const risk = "moderate";
  const expected = getPortfolio([...brokers], risk);
  const expectedSectors = getSectorBreakdown(expected.positions);

  await page.goto("/");
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  for (const broker of brokers) {
    await page.getByTestId(`broker-${broker}`).click();
  }
  await page.getByRole("button", { name: "Next page" }).click();

  await expect(
    page.getByText("What is your portfolio risk level?"),
  ).toBeVisible();
  await page.getByTestId(`risk-${risk}`).click();
  await page.getByRole("button", { name: "Next page" }).click();

  await expect(
    page.getByText("How many years do you work with brokerage?"),
  ).toBeVisible();
  await page.getByTestId("years-5-9").click();
  await page.getByRole("button", { name: "Consolidate your portfolio" }).click();

  await expect(page.getByText("Unified Portfolio Dashboard")).toBeVisible({
    timeout: 6000,
  });

  await expect(page.getByTestId("dashboard-broker-label")).toHaveText(
    expected.brokerLabel,
  );
  await expect(page.getByTestId("dashboard-total")).toHaveText(
    formatUsd(expected.total),
  );

  for (const p of expected.positions) {
    await expect(page.getByTestId(`dashboard-position-${p.symbol}`)).toContainText(
      formatUsd(p.value),
    );
  }

  const legendText = await page.getByTestId("dashboard-sector-legend").innerText();
  for (const s of expectedSectors) {
    expect(legendText).toContain(`${s.sector} — ${Math.round(s.pct * 100)}%`);
  }
});
