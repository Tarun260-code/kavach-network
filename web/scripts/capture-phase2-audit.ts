import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Trust Center (/trust)
  console.log("[1/4] Capturing Trust Center (/trust)...");
  await page.goto("http://127.0.0.1:3000/trust");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase2-trust-center.png"),
    fullPage: false,
  });

  // 2. Interactive Explainer & In-Browser Live Demo (/)
  console.log("[2/4] Capturing Landing Page Interactive Explainer...");
  await page.goto("http://127.0.0.1:3000/#how-it-works");
  await page.waitForTimeout(600);
  // Scroll directly into view of the interactive explainer
  const explainer = page.locator("text=Interactive 4-Step Walkthrough");
  if (await explainer.count() > 0) {
    await explainer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase2-interactive-explainer.png"),
  });

  // 3. Glossary Term Popover (/bank/sbi/screen)
  console.log("[3/4] Capturing Glossary Popover (<Term> in action)...");
  await page.goto("http://127.0.0.1:3000/bank/sbi/screen");
  await page.waitForTimeout(500);
  const termTrigger = page.locator("role=button[name*='Definition of']").first();
  if (await termTrigger.count() > 0) {
    await termTrigger.hover();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase2-glossary-popover.png"),
  });

  // 4. Honesty Legend & Institutional Footer (/)
  console.log("[4/4] Capturing Transparency Legend in Footer...");
  await page.goto("http://127.0.0.1:3000");
  await page.waitForTimeout(500);
  const legend = page.locator("text=Protocol Transparency Legend:");
  if (await legend.count() > 0) {
    await legend.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase2-honesty-legend.png"),
  });

  await browser.close();
  console.log("\nAll Phase 2 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Phase 2 Screenshot Error:", err);
  process.exit(1);
});

