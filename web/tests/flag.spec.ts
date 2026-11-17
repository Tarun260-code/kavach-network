import { test, expect } from "@playwright/test";

test.describe("Member Bank Fraud Flagging Flow", () => {
  test("Navigates to SBI portal and flags a confirmed fraud commitment", async ({ page }) => {
    // 1. Visit State Bank of India portal
    await page.goto("/bank/sbi");
    await expect(page.locator("h1")).toContainText("State Bank of India");

    // 2. Verify initial portfolio contains seeded commitments
    await expect(page.locator("text=Active Fraud Portfolio for SBI")).toBeVisible();
    await expect(page.locator("text=BKU••••2Q")).toBeVisible();

    // 3. Fill in fraud flagging form
    const inputField = page.locator('input[placeholder*="BKUPG8492Q"]');
    await inputField.fill("NEWFR1234X");

    // 4. Verify live leaf preview is computed
    await expect(page.locator("text=Calculated Merkle Leaf:")).toBeVisible();
    await expect(page.locator("text=Valid BN254 Commitment")).toBeVisible();

    // 5. Submit flag with 0.05 ETH stake
    const submitBtn = page.locator("button:has-text('Confirm Fraud & Stake 0.05 ETH')");
    await submitBtn.click();

    // 6. Verify toast notification and portfolio update
    await expect(page.locator("text=Fraud Commitment Flagged")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=NEW••••4X")).toBeVisible();
  });
});

