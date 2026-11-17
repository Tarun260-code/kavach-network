import { test, expect } from "@playwright/test";

test.describe("AppealDAO Adjudication & 2/3 Quorum Slashing Flow", () => {
  test("Navigates to AppealDAO, votes to reach 4/5 supermajority, and executes revocation with slashing", async ({ page }) => {
    // 1. Visit AppealDAO
    await page.goto("/dao");
    await expect(page.locator("h1")).toContainText("AppealDAO Fraud Adjudication Chamber");

    // 2. Verify quorum parameters (4 / 5 Banks required)
    await expect(page.locator("text=4 / 5 (80%)")).toBeVisible();
    await expect(page.locator("text=Appeal #1")).toBeVisible();
    await expect(page.locator("text=DISP99999P")).toBeVisible();

    // 3. Vote as PNB to reach 3/4
    const voteBtn = page.locator("button:has-text('Vote to Revoke Leaf & Slash Stake')").first();
    await voteBtn.click();
    await expect(page.locator("text=3 / 4")).toBeVisible();

    // 4. Switch voting bank to Axis Bank and cast final required vote
    const bankSelect = page.locator("select").first();
    await bankSelect.selectOption("axis");

    await voteBtn.click();
    await expect(page.locator("text=4 / 4")).toBeVisible();

    // 5. Execute Revocation and Slashing
    const executeBtn = page.locator("button:has-text('Execute Revocation & Slashing')").first();
    await expect(executeBtn).toBeEnabled();
    await executeBtn.click();

    // 6. Verify execution outcome
    await expect(page.locator("text=Appeal Executed & Stake Slashed")).toBeVisible();
    await expect(page.locator("text=Historical Dispute Resolutions")).toBeVisible();
    await expect(page.locator("text=DISP99999P")).toBeVisible();
  });
});
