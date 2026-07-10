import { test, expect } from "@playwright/test";

test("cover -> onboarding -> loading transitions with correct final state", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page.getByTestId("broker-XTB").click();
  await page.getByTestId("broker-SAXO").click();

  const next2 = page.getByRole("button", { name: "Next page" });
  await expect(next2).toBeEnabled();
  await next2.click();

  await expect(
    page.getByText("What is your portfolio risk level?"),
  ).toBeVisible();
  await page.getByTestId("risk-aggressive").click();
  await page.getByRole("button", { name: "Next page" }).click();

  await expect(
    page.getByText("How many years do you work with brokerage?"),
  ).toBeVisible();
  await page.getByTestId("years-10+").click();
  await page.getByRole("button", { name: "Consolidate your portfolio" }).click();

  await expect(page.getByText("LOADING YOUR DEMO PORTFOLIO")).toBeVisible();

  await expect(page.getByText("Unified Portfolio Dashboard")).toBeVisible({
    timeout: 6000,
  });

  const state = await page.evaluate(() => window.__onboardingState);
  expect(state).toEqual({
    page: "page5",
    brokers: ["INTERACTIVE BROKERS (IBKR)", "XTB", "SAXO"],
    risk: "aggressive",
    years: "10+",
  });
});

test("broker selection caps at 3 and disables Next at 0", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  const next = page.getByRole("button", { name: "Next page" });
  await expect(next).toBeDisabled();

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page.getByTestId("broker-XTB").click();
  await page.getByTestId("broker-SAXO").click();
  await page.getByTestId("broker-WIO").click();

  const state = await page.evaluate(() => window.__onboardingState?.brokers);
  expect(state).toHaveLength(3);
  expect(state).not.toContain("WIO");
  await expect(next).toBeEnabled();
});

test("back navigation is locked once a page has been left", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  await page.getByTestId("broker-XTB").click();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(
    page.getByText("What is your portfolio risk level?"),
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByText("What is your portfolio risk level?"),
  ).toBeVisible();
  await expect(page.getByText("Which broker/s do you use?")).toHaveCount(0);
});
