import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routes = [
  { name: "landing", path: "/" },
  { name: "bank-meridian", path: "/bank/meridian" },
  { name: "bank-kestrel", path: "/bank/kestrel" },
  { name: "onboard-scanner", path: "/bank/meridian/onboard" },
  { name: "network", path: "/network" },
  { name: "dao", path: "/dao" },
];

test.describe("Phase 3 Responsive Visual Verification", () => {
  // 1440px Desktop Viewports
  for (const r of routes) {
    test(`Capture 1440px Desktop: ${r.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${r.name}-1440px.png`),
        fullPage: true,
      });
    });
  }

  // 390px Mobile Viewports
  for (const r of routes) {
    test(`Capture 390px Mobile: ${r.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(r.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${r.name}-390px.png`),
        fullPage: true,
      });
    });
  }
});

