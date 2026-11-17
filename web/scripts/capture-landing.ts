import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function main() {
  const artifactDir = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1440px Desktop View
  console.log("Capturing 1440px desktop landing page...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(artifactDir, "landing-1440px.png"),
    fullPage: true,
  });
  await desktopContext.close();

  // 1024px Tablet View
  console.log("Capturing 1024px tablet landing page...");
  const tabletContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 2,
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await tabletPage.waitForTimeout(500);
  await tabletPage.screenshot({
    path: path.join(artifactDir, "landing-1024px.png"),
    fullPage: true,
  });
  await tabletContext.close();

  // 390px Mobile View
  console.log("Capturing 390px mobile landing page...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);

  // Check horizontal overflow at 390px
  const overflow = await mobilePage.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log("390px Overflow Check:", overflow);

  await mobilePage.screenshot({
    path: path.join(artifactDir, "landing-390px.png"),
    fullPage: true,
  });
  await mobileContext.close();

  await browser.close();
  console.log("Successfully captured all landing page screenshots.");
}

main().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});

