import { test, expect } from "@playwright/test";

async function goToDashboard(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByText("Which broker/s do you use?")).toBeVisible({
    timeout: 6000,
  });

  await page.getByTestId("broker-INTERACTIVE BROKERS (IBKR)").click();
  await page.getByTestId("broker-SAXO").click();
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
}

function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

test.describe("dashboard widgets", () => {
  test("market calendar reveals hover info per exchange and supports multi-select via click", async ({
    page,
  }) => {
    await goToDashboard(page);
    await expect(page.getByTestId("calendar-strip")).toBeVisible({
      timeout: 10000,
    });

    await page.getByTestId("exchange-NYSE").hover();
    await expect(page.getByTestId("exchange-panel-NYSE")).toContainText(
      "9:30–16:00 ET",
    );

    await page.getByTestId("exchange-LSE").hover();
    await expect(page.getByTestId("exchange-panel-LSE")).toContainText(
      "8:00–16:30 GMT",
    );
    await expect(page.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "false",
    );

    await page.getByTestId("exchange-NYSE").click();
    await page.getByTestId("exchange-HKEX").click();
    await expect(page.getByTestId("calendar-clear")).toBeVisible();
    await expect(page.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "true",
    );
    await expect(page.getByTestId("exchange-panel-HKEX")).toHaveAttribute(
      "data-open",
      "true",
    );

    await page.getByTestId("calendar-clear").click();
    await expect(page.getByTestId("calendar-clear")).not.toBeVisible();
    await expect(page.getByTestId("exchange-panel-NYSE")).toHaveAttribute(
      "data-open",
      "false",
    );
    await expect(page.getByTestId("exchange-panel-HKEX")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  test("Pelosi widget expands and reaching the 11th row via scroll retires the 1st", async ({
    page,
  }) => {
    await goToDashboard(page);
    await expect(page.getByTestId("widget-pelosi")).toHaveAttribute(
      "data-revealed",
      "true",
      { timeout: 10000 },
    );

    await page.getByTestId("widget-pelosi-header").click();
    await expect(page.getByTestId("widget-pelosi-row-9")).toBeVisible();
    await expect(
      page.getByTestId("widget-pelosi-row-10"),
    ).not.toBeVisible();

    const body = page.getByTestId("widget-pelosi-body");
    const box = await body.boundingBox();
    if (!box) throw new Error("Pelosi body not found");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 100);

    await expect(page.getByTestId("widget-pelosi-row-10")).toBeVisible();
    await expect(page.getByTestId("widget-pelosi-row-0")).not.toBeVisible();

    // can't scroll past the last row
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, 100);
    }
    await expect(page.getByTestId("widget-pelosi-row-49")).toBeVisible();

    // can't scroll above the first row
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, -100);
    }
    await expect(page.getByTestId("widget-pelosi-row-0")).toBeVisible();
  });

  test("the 4 widgets and the disclaimer never overlap at the 1440px baseline", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await goToDashboard(page);

    await expect(page.getByTestId("widget-news")).toHaveAttribute(
      "data-revealed",
      "true",
      { timeout: 12000 },
    );

    await page.getByTestId("widget-pelosi-header").click();
    await page.getByTestId("widget-warsh-header").click();
    await page.getByTestId("widget-news-header").click();

    const calendarBox = await page.getByTestId("calendar-strip").boundingBox();
    const pelosiBox = await page.getByTestId("widget-pelosi").boundingBox();
    const warshBox = await page.getByTestId("widget-warsh").boundingBox();
    const newsBox = await page.getByTestId("widget-news").boundingBox();
    const disclaimerBox = await page.getByTestId("disclaimer").boundingBox();

    expect(calendarBox).toBeTruthy();
    expect(pelosiBox).toBeTruthy();
    expect(warshBox).toBeTruthy();
    expect(newsBox).toBeTruthy();
    expect(disclaimerBox).toBeTruthy();

    const boxes = [
      ["pelosi", pelosiBox!],
      ["warsh", warshBox!],
      ["news", newsBox!],
      ["disclaimer", disclaimerBox!],
    ] as const;

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [nameA, boxA] = boxes[i];
        const [nameB, boxB] = boxes[j];
        expect(
          overlaps(boxA, boxB),
          `${nameA} should not overlap ${nameB}`,
        ).toBe(false);
      }
    }
  });
});
