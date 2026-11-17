import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOT_DIR = "C:/Users/P Sai Tarun/.gemini/antigravity/brain/f9d09997-741a-4718-9a74-d8088b20aea8/screenshots";

const FAILURE_MODES = [
  "node_offline",
  "wrong_network",
  "contracts_not_deployed",
  "proof_failure",
  "root_not_known",
  "duplicate_flag",
  "insufficient_stake",
  "appeal_window_closed",
  "event_stream_disconnected",
] as const;

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log("Launching Chromium to capture 9 failure mode states...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000/network", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (const mode of FAILURE_MODES) {
    console.log(`Triggering failure mode: ${mode}...`);
    await page.evaluate((m) => {
      // @ts-ignore
      if (typeof window.__triggerSystemStatus === "function") {
        // @ts-ignore
        window.__triggerSystemStatus(m);
      }
    }, mode);

    // Wait for the banner/card to animate into view
    await page.waitForTimeout(600);

    const outPath = path.join(SCREENSHOT_DIR, `phase5-failure-${mode}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Also reset to healthy at the end
  await page.evaluate(() => {
    // @ts-ignore
    if (typeof window.__triggerSystemStatus === "function") {
      // @ts-ignore
      window.__triggerSystemStatus("healthy");
    }
  });

  await browser.close();
  console.log("All 9 failure mode screenshots successfully captured!");
}

main().catch((err) => {
  console.error("Error capturing failure screenshots:", err);
  process.exit(1);
});
