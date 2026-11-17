import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Light Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopContext.newPage();

  // 1. Brand Portal Light (/brand)
  console.log("[1/5] Capturing Brand Portal Light (/brand)...");
  await page.goto("http://127.0.0.1:3000/brand");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase3-brand-portal-light.png"),
  });

  // 2. Brand Portal Dark (/brand with data-theme="dark")
  console.log("[2/5] Capturing Brand Portal Dark (/brand)...");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase3-brand-portal-dark.png"),
  });

  // Reset theme for subsequent captures
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  // 3. Hero Visual with Signature Animated Proof Network (/)
  console.log("[3/5] Capturing Landing Page Proof Network Hero visual...");
  await page.goto("http://127.0.0.1:3000");
  await page.waitForTimeout(1000); // let animation cycle reach peak particle flow
  const heroVisual = page.locator("text=Cryptographic Proof Network (Live)");
  if (await heroVisual.count() > 0) {
    await heroVisual.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase3-hero-proof-network.png"),
  });

  // 4. Network Data Visualisation & Ring Velocity Map (/network)
  console.log("[4/5] Capturing Network Charts & Ring Velocity Topology (/network)...");
  await page.goto("http://127.0.0.1:3000/network");
  await page.waitForTimeout(700);
  // Switch to Ring Velocity tab if available
  const velocityTab = page.locator("button:has-text('Ring velocity')");
  if (await velocityTab.count() > 0) {
    await velocityTab.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase3-network-charts.png"),
  });

  // 5. Mobile Brand Portal (390x844)
  console.log("[5/5] Capturing Mobile Brand Portal at 390px (/brand)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/brand");
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase3-mobile-brand-390.png"),
  });

  await browser.close();
  console.log("\nAll Phase 3 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Phase 3 Screenshot Error:", err);
  process.exit(1);
});

