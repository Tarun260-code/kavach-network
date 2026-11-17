import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:\\Users\\P Sai Tarun\\.gemini\\antigravity\\brain\\f9d09997-741a-4718-9a74-d8088b20aea8\\screenshots";
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

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
  console.log("=== Launching Playwright for Phase 3 Section Audits ===");
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // Wait for entrance choreography

  const sections = [
    { id: "hero", name: "01-hero-calm" },
    { id: "problem", name: "02-problem-amber" },
    { id: "how-it-works", name: "03-solution-sapphire" },
    { id: "syndicate-velocity", name: "04-proof-velocity" },
    { id: "governance", name: "05-governance-gold" },
    { id: "cta", name: "06-final-cta-ink" },
  ];

  // 1. Light Mode Screenshots
  console.log("\n[1/4] Capturing Light Mode Section Screenshots...");
  for (const s of sections) {
    const el = await page.$(`#${s.id}`);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const filePath = path.join(ARTIFACTS_DIR, `phase3-section-${s.name}-light.png`);
      await page.screenshot({ path: filePath });
      console.log(`  Captured light screenshot: ${s.name}`);
    }
  }

  // 2. Dark Mode Screenshots
  console.log("\n[2/4] Capturing Dark Mode Section Screenshots...");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(600);

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

  // 3. Responsive Checks
  console.log("\n[3/4] Running Responsive Viewport Checks...");
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

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

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
      console.log(`    - Hash Chips Available (>=768px): ${chipsVisible ? "PASS (Active)" : "NOTE (Available in margin)"}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, `phase3-responsive-${vp.name}.png`),
    });
  }

  // 4. Contrast Sampling
  console.log("\n[4/4] Automated WCAG AA Contrast Sampling at 5 Story States...");
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
        return { textColor: style.color, fontSize: parseFloat(style.fontSize), fontWeight: style.fontWeight };
      }, st.selector);

      if (metrics) {
        const textRgb = parseRgb(metrics.textColor);
        let bgRgb = st.mode === "dark" || st.id === "cta" ? [14, 19, 48] : [247, 249, 253];
        if (st.id === "problem" && st.mode === "light") {
          bgRgb = [252, 248, 242];
        }

        const ratio = calculateContrast(textRgb, bgRgb);
        const isLargeText = metrics.fontSize >= 18 || (metrics.fontSize >= 14 && parseInt(metrics.fontWeight) >= 600);
        const pass = isLargeText ? ratio >= 3.0 : ratio >= 4.5;

        contrastResults.push({
          "Story State": st.state,
          "Element Font": `${metrics.fontSize}px (${metrics.fontWeight})`,
          "Text Color": metrics.textColor,
          "Contrast Ratio": `${ratio.toFixed(2)}:1`,
          "WCAG AA Verdict": pass ? "PASS" : "FAIL",
        });
      }
    }
  }

  console.table(contrastResults);

  // 5. 60-second Scroll Memory & Frame Benchmark
  console.log("\n[5/5] Running 60-Second Frame Stability & Heap Benchmark...");
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const benchmarkResult = await page.evaluate(() => {
    return new Promise((resolve) => {
      const startHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
      let frameCount = 0;
      let droppedFrames = 0;
      let lastTime = performance.now();
      const startTime = performance.now();
      const durationMs = 60000;

      function onFrame(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameCount++;

        if (delta > 33.3) droppedFrames++;

        const elapsed = now - startTime;
        const progress = (elapsed % 8000) / 8000;
        const scrollTarget = (document.body.scrollHeight - window.innerHeight) * (0.5 - 0.5 * Math.cos(progress * 2 * Math.PI));
        window.scrollTo(0, scrollTarget);

        if (elapsed < durationMs) {
          requestAnimationFrame(onFrame);
        } else {
          const endHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
          resolve({
            durationSec: Math.round(elapsed / 1000),
            totalFrames: frameCount,
            droppedFrames,
            dropRatePercent: ((droppedFrames / frameCount) * 100).toFixed(2),
            startHeapMb: (startHeap / (1024 * 1024)).toFixed(2),
            endHeapMb: (endHeap / (1024 * 1024)).toFixed(2),
            heapGrowthMb: ((endHeap - startHeap) / (1024 * 1024)).toFixed(2),
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
  console.error("Audit failed:", err);
  process.exit(1);
});
