import { test, expect } from "@playwright/test";
import * as XLSX from "xlsx";
import { COMPETITIVE_ASSETS } from "../src/lib/competitiveAssets";
import { COMPETITIVE_ASSET_EXPORT_HEADERS } from "../src/lib/exportCompetitiveAssets";

async function goToCompetitiveAssetView(page: import("@playwright/test").Page) {
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
}

test("clicking through all 20 assets updates the center mockup every time", async ({
  page,
}) => {
  await goToCompetitiveAssetView(page);

  let previousName = "";
  for (const asset of COMPETITIVE_ASSETS) {
    await page.getByTestId(`asset-item-${asset.ticker}`).click();

    await expect(page.getByTestId(`asset-item-${asset.ticker}`)).toHaveAttribute(
      "data-active",
      "true",
    );
    const name = await page.getByTestId("asset-mockup-name").innerText();
    expect(name).toBe(asset.name);
    expect(name).not.toBe(previousName);
    previousName = name;
  }
});

test("center mockup matches fixture peer-group data for sampled assets", async ({
  page,
}) => {
  await goToCompetitiveAssetView(page);

  const sampled = [
    COMPETITIVE_ASSETS[0],
    COMPETITIVE_ASSETS[Math.floor(COMPETITIVE_ASSETS.length / 2)],
    COMPETITIVE_ASSETS[COMPETITIVE_ASSETS.length - 1],
  ];

  for (const asset of sampled) {
    await page.getByTestId(`asset-item-${asset.ticker}`).click();

    await expect(page.getByTestId("asset-mockup-name")).toHaveText(asset.name);
    await expect(page.getByTestId("asset-mockup-cap")).toContainText(
      asset.marketCap,
    );

    for (const peer of asset.peers) {
      const row = page.getByTestId(`asset-peer-${peer.name}`);
      await expect(row).toContainText(peer.name);
      if (peer.marketCap) await expect(row).toContainText(peer.marketCap);
    }
  }
});

test("save button downloads a valid .xlsx with the expected headers", async ({
  page,
}) => {
  await goToCompetitiveAssetView(page);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("save-results-button").click(),
  ]);

  expect(download.suggestedFilename()).toBe("competitive-asset-view.xlsx");

  const filePath = await download.path();
  expect(filePath).toBeTruthy();

  const workbook = XLSX.readFile(filePath as string);
  const sheet = workbook.Sheets["Competitive Asset View"];
  expect(sheet).toBeDefined();

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  expect(rows[0]).toEqual([...COMPETITIVE_ASSET_EXPORT_HEADERS]);
  expect(rows).toHaveLength(COMPETITIVE_ASSETS.length + 1);
});

test("left arrow returns to the dashboard and right arrow advances past the view", async ({
  page,
}) => {
  await goToCompetitiveAssetView(page);

  await page.getByTestId("competitive-prev-arrow").click();
  await expect(page.getByText("Unified Portfolio Dashboard")).toBeVisible();

  await page.getByTestId("dashboard-next-arrow").click();
  await expect(page.getByText("Competitive Asset View")).toBeVisible();

  await page.getByTestId("competitive-next-arrow").click();
  await expect(
    page.getByText("Correlation Analysis of your investments"),
  ).toBeVisible();
});
