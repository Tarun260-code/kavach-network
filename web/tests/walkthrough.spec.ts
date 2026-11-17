import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Kavach Network 60-Second Full Protocol Walkthrough", () => {
  test("Executes complete end-to-end user journey with video recording", async ({ browser }) => {
    test.setTimeout(120000);

    const artifactDir = "C:/Users/P Sai Tarun/.gemini/antigravity/brain/f9d09997-741a-4718-9a74-d8088b20aea8";
    const videoDir = path.join(artifactDir, "walkthrough_raw");
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: videoDir,
        size: { width: 1440, height: 900 },
      },
    });

    const page = await context.newPage();

    // ----------------------------------------------------
    // SCENE 1: Consortium Landing Page & Architecture (0:00 - 0:10)
    // ----------------------------------------------------
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Armouring Indian Banking Against Syndicated Loan Stacking");
    await page.waitForTimeout(2000);

    // Scroll through protocol flow: Commit, Anchor, Prove
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
    await page.waitForTimeout(2500);

    // Scroll to Privacy Guarantees table
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
    await page.waitForTimeout(2500);

    // Scroll to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1500);

    // ----------------------------------------------------
    // SCENE 2: Bank Console & Zero-PII Fraud Flagging (0:10 - 0:24)
    // ----------------------------------------------------
    await page.goto("/bank/sbi");
    await expect(page.locator("h1")).toContainText("State Bank of India");
    await page.waitForTimeout(2000);

    // Fill in national identifier to trigger real in-browser Poseidon leaf preview
    const testPan = "KAV" + Math.floor(1000 + Math.random() * 9000) + "P";
    const idInput = page.locator('input[placeholder*="BKUPG8492Q"]');
    await idInput.fill(testPan);
    await page.waitForTimeout(1500);

    // Verify leaf calculated
    await expect(page.locator("text=Calculated Merkle Leaf:")).toBeVisible();
    await page.waitForTimeout(1500);

    // Submit flag on-chain with 0.05 ETH stake
    const submitBtn = page.locator("button:has-text('Confirm Fraud & Stake 0.05 ETH')");
    await submitBtn.click();

    // Observe confirmation toast & on-chain payload
    await expect(page.locator("text=Fraud Commitment Flagged")).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(2500);

    // ----------------------------------------------------
    // SCENE 3: Real-Time ZK Applicant Screening & Ring Velocity (0:24 - 0:40)
    // ----------------------------------------------------
    await page.goto("/bank/hdfc/onboard");
    await expect(page.locator("h1")).toContainText("HDFC Bank • Credit Applicant Kavach Verification");
    await page.waitForTimeout(2000);

    // Select Syndicate Attack suspect
    await page.locator("button:has-text('Syndicate Attack (Seed)')").click();
    await page.waitForTimeout(1500);

    // Run real ZK screening
    const screenBtn = page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')");
    await screenBtn.click();

    // ProofTerminal executes live SNARK prover
    await expect(page.locator("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking")).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000);

    // Inspect Privacy & DPDP Audit Inspector
    const inspectorBtn = page.locator("button:has-text('Privacy & DPDP Audit Inspector')");
    await inspectorBtn.click();
    await page.waitForTimeout(2500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1500);

    // ----------------------------------------------------
    // SCENE 4: Network Live Ledger & Velocity Leaderboard (0:40 - 0:50)
    // ----------------------------------------------------
    await page.goto("/network");
    await expect(page.locator("h1")).toContainText("Consortium Cryptographic Ledger");
    await page.waitForTimeout(2000);

    // Scroll to Merkle root history & ring velocity leaderboard
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
    await page.waitForTimeout(3500);

    // ----------------------------------------------------
    // SCENE 5: AppealDAO 2/3 Quorum Slashing Adjudication (0:50 - 1:02)
    // ----------------------------------------------------
    await page.goto("/dao");
    await expect(page.locator("h1")).toContainText("AppealDAO Fraud Adjudication Chamber");
    await page.waitForTimeout(2000);

    // Check contested flag DISP99999P
    await expect(page.locator("text=DISP99999P")).toBeVisible();
    await page.waitForTimeout(1000);

    // Cast vote as PNB (Account 5)
    const voteBtn = page.locator("button:has-text('Vote to Revoke Leaf & Slash Stake')").first();
    await voteBtn.click();
    await expect(page.locator("text=3 / 4")).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(1500);

    // Switch to Axis Bank to reach 4/4 supermajority
    const bankSelect = page.locator("select").first();
    await bankSelect.selectOption("axis");
    await page.waitForTimeout(1000);
    await voteBtn.click();
    await expect(page.locator("text=4 / 4")).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(1500);

    // Execute Revocation and Stake Slashing
    const executeBtn = page.locator("button:has-text('Execute Revocation & Slashing')").first();
    await executeBtn.click();
    await expect(page.locator("text=Appeal Executed & Stake Slashed")).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(3000);

    // Close page and context to finalize video
    await page.close();
    await context.close();

    // Move or copy recorded video to target artifact location
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find((f) => f.endsWith(".webm"));
    if (videoFile) {
      const srcPath = path.join(videoDir, videoFile);
      const destPath = path.join(artifactDir, "kavach-protocol-walkthrough.webm");
      fs.copyFileSync(srcPath, destPath);
      console.log(`Video walkthrough successfully saved to: ${destPath}`);
    }
  });
});
