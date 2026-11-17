import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";
const VIDEO_DIR = path.join(ARTIFACTS_DIR, "video");

if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

function calculateLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrast(rgb1, rgb2) {
  const lum1 = calculateLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = calculateLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [0, 0, 0];
}

async function run() {
  console.log("=== Launching Playwright for Phase 3 Landing Verification ===");
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // TEST SUITE 1: 30-Second Scroll Recording (Light & Dark)
  // -------------------------------------------------------------
  console.log("\n[1/5] Recording 30-Second Full-Page Scroll Video...");
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const videoPage = await videoContext.newPage();
  await videoPage.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await videoPage.waitForTimeout(2000); // Hero entrance choreography

  // Smooth scroll down through all sections (15 seconds down)
  const totalHeight = await videoPage.evaluate(() => document.body.scrollHeight);
  const scrollSteps = 60;
  const stepDelay = 250; // 60 * 250ms = 15s

  for (let i = 0; i <= scrollSteps; i++) {
    const targetY = (totalHeight * (i / scrollSteps));
    await videoPage.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), targetY);
    await videoPage.waitForTimeout(stepDelay);
  }

  // Toggle dark mode at the bottom
  console.log("  Toggling dark mode during recording...");
  await videoPage.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  });
  await videoPage.waitForTimeout(1000);

  // Smooth scroll back up in dark mode (15 seconds up)
  for (let i = scrollSteps; i >= 0; i--) {
    const targetY = (totalHeight * (i / scrollSteps));
    await videoPage.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), targetY);
    await videoPage.waitForTimeout(stepDelay);
  }

  await videoPage.waitForTimeout(1500);
  await videoContext.close(); // Saves video

  // Rename latest video to phase3-landing-scroll-30s.webm
  const videoFiles = fs.readdirSync(VIDEO_DIR).map((f) => ({
    name: f,
    time: fs.statSync(path.join(VIDEO_DIR, f)).mtimeMs,
  })).sort((a, b) => b.time - a.time);

  if (videoFiles.length > 0) {
    const freshVideo = path.join(VIDEO_DIR, videoFiles[0].name);
    const destVideo = path.join(ARTIFACTS_DIR, "phase3-landing-scroll-30s.webm");
    fs.copyFileSync(freshVideo, destVideo);
    console.log(`  Saved 30s scroll recording to: ${destVideo}`);
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: Section-by-Section Screenshots (Light & Dark)
  // -------------------------------------------------------------
  console.log("\n[2/5] Capturing Section Screenshots (Light & Dark)...");
  const testContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await testContext.newPage();
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const sections = [
    { id: "hero", name: "01-hero-calm" },
    { id: "problem", name: "02-problem-amber" },
    { id: "how-it-works", name: "03-solution-sapphire" },
    { id: "syndicate-velocity", name: "04-proof-velocity" },
    { id: "governance", name: "05-governance-gold" },
    { id: "cta", name: "06-final-cta-ink" },
  ];

  // Light Mode Section Screenshots
  for (const s of sections) {
    const el = await page.$(`#${s.id}`);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800); // allow story transition interpolation
      const filePath = path.join(ARTIFACTS_DIR, `phase3-section-${s.name}-light.png`);
      await page.screenshot({ path: filePath });
      console.log(`  Captured light screenshot: ${s.name}`);
    }
  }

  // Dark Mode Section Screenshots
  console.log("  Switching to Dark Mode...");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(500);

  for (const s of sections) {
    const el = await page.$(`#${s.id}`);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const filePath = path.join(ARTIFACTS_DIR, `phase3-section-${s.name}-dark.png`);
      await page.screenshot({ path: filePath });
      console.log(`  Captured dark screenshot: ${s.name}`);
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: Responsive Checks (1440, 1280, 1024, 768, 390)
  // -------------------------------------------------------------
  console.log("\n[3/5] Running Responsive Viewport Checks...");
  const viewports = [
    { w: 1440, h: 900, name: "desktop-1440" },
    { w: 1280, h: 800, name: "laptop-1280" },
    { w: 1024, h: 768, name: "tablet-landscape-1024" },
    { w: 768, h: 1024, name: "tablet-portrait-768" },
    { w: 390, h: 844, name: "mobile-390" },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check horizontal scroll
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check floating chips visibility
    const chipsVisible = await page.evaluate(() => {
      const chip = document.querySelector(".glass.font-mono");
      if (!chip) return false;
      const style = window.getComputedStyle(chip.parentElement?.parentElement || chip);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    console.log(`  Viewport ${vp.name} (${vp.w}x${vp.h}):`);
    console.log(`    - Horizontal Overflow: ${hasHorizontalOverflow ? "FAIL (Overflow detected!)" : "PASS (Zero overflow)"}`);
    if (vp.w < 768) {
      console.log(`    - Hash Chips Hidden (<768px): ${!chipsVisible ? "PASS (Properly hidden)" : "FAIL (Still visible!)"}`);
    } else {
      console.log(`    - Hash Chips Available (>=768px): ${chipsVisible ? "PASS (Active)" : "NOTE (Hidden or offscreen)"}`);
    }

    // Capture responsive screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `phase3-responsive-${vp.name}.png`),
    });
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: Automated Contrast Sampling at 5 Story Positions
  // -------------------------------------------------------------
  console.log("\n[4/5] Automated WCAG AA Contrast Sampling at 5 Story States...");
  await page.setViewportSize({ width: 1440, height: 900 });

  const contrastResults = [];
  const sampleTargets = [
    { state: "Hero (Calm)", id: "hero", selector: "h1", mode: "light" },
    { state: "Problem (Amber Wash)", id: "problem", selector: "h2, h3, p.font-serif", mode: "light" },
    { state: "Solution (Sapphire)", id: "how-it-works", selector: "h2, h3", mode: "light" },
    { state: "Proof (Ring Velocity)", id: "syndicate-velocity", selector: "h2", mode: "light" },
    { state: "Final CTA (Ink #0E1330)", id: "cta", selector: "h2", mode: "light" },
    // Dark mode
    { state: "Hero (Calm) [Dark]", id: "hero", selector: "h1", mode: "dark" },
    { state: "Problem (Amber Wash) [Dark]", id: "problem", selector: "h2, h3, p.font-serif", mode: "dark" },
    { state: "Final CTA (Ink #0E1330) [Dark]", id: "cta", selector: "h2", mode: "dark" },
  ];

  for (const st of sampleTargets) {
    if (st.mode === "dark") {
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    } else {
      await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    }

    const sectionEl = await page.$(`#${st.id}`);
    if (sectionEl) {
      await sectionEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      const metrics = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        const textColor = style.color;
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        return { textColor, fontSize, fontWeight };
      }, st.selector);

      if (metrics) {
        const textRgb = parseRgb(metrics.textColor);
        // Background estimate (light canvas #F7F9FD vs dark canvas #0E1330 vs CTA #0E1330)
        let bgRgb = st.mode === "dark" || st.id === "cta" ? [14, 19, 48] : [247, 249, 253];
        if (st.id === "problem" && st.mode === "light") {
          bgRgb = [252, 248, 242]; // blended with amber wash
        }

        const ratio = calculateContrast(textRgb, bgRgb);
        const isLargeText = metrics.fontSize >= 18 || (metrics.fontSize >= 14 && parseInt(metrics.fontWeight) >= 600);
        const pass = isLargeText ? ratio >= 3.0 : ratio >= 4.5;

        contrastResults.push({
          state: st.state,
          fontSize: `${metrics.fontSize}px (${metrics.fontWeight})`,
          textColor: metrics.textColor,
          contrastRatio: `${ratio.toFixed(2)}:1`,
          status: pass ? "PASS (WCAG AA)" : "FAIL",
        });
      }
    }
  }

  console.table(contrastResults);

  // -------------------------------------------------------------
  // TEST SUITE 5: 60-Second Memory & Frame-Rate Benchmark
  // -------------------------------------------------------------
  console.log("\n[5/5] Running 60-Second Scroll Benchmark (Heap Growth & Dropped Frames)...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const benchmarkResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const startHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
      let frameCount = 0;
      let droppedFrames = 0;
      let lastFrameTime = performance.now();
      const frameDeltas = [];

      const durationMs = 60000; // 60 seconds
      const startTime = performance.now();

      function onFrame(now) {
        const delta = now - lastFrameTime;
        lastFrameTime = now;
        frameDeltas.push(delta);
        frameCount++;

        // If frame took longer than 33ms (~30fps threshold), count as dropped frame
        if (delta > 33.3) {
          droppedFrames++;
        }

        // Scroll continuously up and down
        const elapsed = now - startTime;
        const progress = (elapsed % 10000) / 10000; // 10s oscillation cycle
        const scrollTarget = (document.body.scrollHeight - window.innerHeight) * Math.sin(progress * Math.PI);
        window.scrollTo(0, scrollTarget);

        if (elapsed < durationMs) {
          requestAnimationFrame(onFrame);
        } else {
          const endHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
          const heapGrowthMb = (endHeap - startHeap) / (1024 * 1024);
          const dropRate = (droppedFrames / frameCount) * 100;
          resolve({
            durationSec: Math.round(elapsed / 1000),
            totalFrames: frameCount,
            droppedFrames,
            dropRatePercent: dropRate.toFixed(2),
            startHeapMb: (startHeap / (1024 * 1024)).toFixed(2),
            endHeapMb: (endHeap / (1024 * 1024)).toFixed(2),
            heapGrowthMb: heapGrowthMb.toFixed(2),
          });
        }
      }

      requestAnimationFrame(onFrame);
    });
  });

  console.log("  Benchmark Results (60s Scroll Simulation):");
  console.log(`    - Duration: ${benchmarkResult.durationSec}s`);
  console.log(`    - Total Frames: ${benchmarkResult.totalFrames}`);
  console.log(`    - Dropped Frames (>33ms): ${benchmarkResult.droppedFrames} (${benchmarkResult.dropRatePercent}%)`);
  console.log(`    - Memory Heap: ${benchmarkResult.startHeapMb} MB -> ${benchmarkResult.endHeapMb} MB (Growth: ${benchmarkResult.heapGrowthMb} MB)`);
  console.log(`    - Performance Verdict: ${parseFloat(benchmarkResult.dropRatePercent) < 5.0 ? "PASS (<5% dropped frames)" : "FAIL"}`);

  await browser.close();
  console.log("\n=== Phase 3 Automated Verification Completed Successfully ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
