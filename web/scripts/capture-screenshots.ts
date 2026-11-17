import { chromium } from "@playwright/test";
import path from "path";

async function main() {
  const screenshotDir = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f8d9977a-a528-4647-95b9-811cd65cae34\\screenshots";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("[1/6] Capturing Dashboard overview...");
  await page.goto("http://127.0.0.1:3000/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "dashboard.png") });

  console.log("[2/6] Capturing Loan Applicant Scanner with Syndicate Alert...");
  await page.goto("http://127.0.0.1:3000/bank/hdfc/onboard");
  await page.locator("button:has-text('Syndicate Attack (Seed)')").click();
  await page.locator("button:has-text('Run Kavach Zero-Knowledge Fraud Check')").click();
  await page.waitForSelector("text=CRITICAL ALERT: Multi-Bank Syndicate Stacking", { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, "onboard-scanner.png") });

  console.log("[3/6] Capturing Privacy & DPDP Inspector Modal...");
  await page.locator("button:has-text('Privacy & DPDP Audit Inspector')").first().click();
  await page.waitForSelector("text=Zero-Knowledge Privacy Inspector");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, "privacy-inspector.png") });

  console.log("[4/6] Capturing AppealDAO Governance Chamber...");
  await page.goto("http://127.0.0.1:3000/dao");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "dao.png") });

  console.log("[5/6] Capturing Syndicate Simulation Sandbox...");
  await page.goto("http://127.0.0.1:3000/demo");
  await page.locator("button:has-text('Start Attack Simulation')").click();
  await page.waitForTimeout(500);
  await page.locator("button:has-text('Advance to Step 2')").click();
  await page.waitForTimeout(500);
  await page.locator("button:has-text('Advance to Step 3')").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, "demo-simulator.png") });

  console.log("[6/6] Capturing Network Merkle Tree Telemetry...");
  await page.goto("http://127.0.0.1:3000/network");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "network.png") });

  await browser.close();
  console.log("All screenshots successfully captured to artifact directory.");
}

main().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});

