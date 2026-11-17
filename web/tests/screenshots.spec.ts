import { test } from "@playwright/test";
import path from "path";

test.describe("UI Visual Verification & Screenshot Capture", () => {
  const screenshotDir = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f8d9977a-a528-4647-95b9-811cd65cae34\\screenshots";

  test("Capture all protocol screens", async ({ page }) => {
    // 1. Dashboard Overview
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, "dashboard.png") });

    // 2. Loan Applicant Scanner with Syndicate Alert
    await page.goto("/bank/hdfc/onboard");
    await page.locator("button:has-text('Syndicate Attack (Seed)')").click();
    await page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();
    await page.waitForSelector("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking", { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "onboard-scanner.png") });

    // 3. Privacy & DPDP Inspector Modal
    await page.locator("button:has-text('Privacy & DPDP Audit Inspector')").first().click();
    await page.waitForSelector("text=Zero-Knowledge Privacy Inspector");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, "privacy-inspector.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // 4. AppealDAO Adjudication Chamber
    await page.goto("/dao");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, "dao.png") });

    // 5. Syndicate Simulation Sandbox
    await page.goto("/demo");
    await page.locator("button:has-text('Start Attack Simulation')").click();
    await page.waitForTimeout(400);
    await page.locator("button:has-text('Advance to Step 2')").click();
    await page.waitForTimeout(400);
    await page.locator("button:has-text('Advance to Step 3')").click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotDir, "demo-simulator.png") });

    // 6. Network Merkle Tree Telemetry
    await page.goto("/network");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, "network.png") });
  });
});

