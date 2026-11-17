import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOT_DIR = "C:/Users/P Sai Tarun/.gemini/antigravity/brain/f9d09997-741a-4718-9a74-d8088b20aea8/screenshots";

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem("kavach_tour_v1", "true");
  });
  const page = await context.newPage();

  console.log("Navigating to /demo...");
  await page.goto("http://localhost:3000/demo", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 1. Capture Pre-flight Checklist All Green
  console.log("Capturing Pre-Flight Checklist...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase5-preflight-all-green.png"),
    fullPage: false,
  });

  // 2. Click "Launch Interactive Consortium Pitch" to enter step 1
  console.log("Launching interactive pitch...");
  const launchBtn = page.getByRole("button", { name: /Launch Interactive Consortium Pitch/i });
  if (await launchBtn.isVisible()) {
    await launchBtn.click();
    await page.waitForTimeout(1000);
  }

  // Capture Step 1
  console.log("Capturing Demo Step 1...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase5-demo-step1.png"),
    fullPage: false,
  });

  // 3. Capture Spotlight Mode (toggle spotlight or advance step)
  console.log("Capturing Spotlight Mode...");
  const spotlightToggle = page.getByRole("button", { name: /Spotlight/i });
  if (await spotlightToggle.isVisible()) {
    await spotlightToggle.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase5-spotlight-mode.png"),
    fullPage: false,
  });

  // 4. Test Panic Reset (Ctrl+Shift+R or Panic button)
  console.log("Testing Panic Reset button...");
  const panicBtn = page.getByRole("button", { name: /Panic Reset/i }).or(page.locator("button:has-text('Reset')"));
  if (await panicBtn.first().isVisible()) {
    await panicBtn.first().click();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "phase5-demo-panic-reset.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("All Demo mode screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Error in walkthrough-demo:", err);
  process.exit(1);
});

