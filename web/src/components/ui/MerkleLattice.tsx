"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { StoryBackgroundState } from "./MeshBackground";

export interface MerkleLatticeProps {
  density?: number;
  intensity?: number;
  paused?: boolean;
  className?: string;
  storyState?: StoryBackgroundState;
  scrollProgress?: number;
  scrollY?: number;
  containerRef?: React.RefObject<HTMLElement>;
}

// 5 Member Banks skin colors & positions
interface BankNodeConfig {
  id: string;
  name: string;
  color: string;
  haloColor: string;
  relX: number;
  relY: number;
}

const BANK_CONFIGS: BankNodeConfig[] = [
  {
    id: "meridian",
    name: "Meridian Bank",
    color: "#0E9F9F",
    haloColor: "rgba(14, 159, 159, 0.28)",
    relX: 0.08,
    relY: 0.22,
  },
  {
    id: "aurum",
    name: "Aurum Trust",
    color: "#D97706",
    haloColor: "rgba(217, 119, 6, 0.28)",
    relX: 0.92,
    relY: 0.20,
  },
  {
    id: "halcyon",
    name: "Halcyon Financial",
    color: "#3358F4",
    haloColor: "rgba(51, 88, 244, 0.28)",
    relX: 0.06,
    relY: 0.62,
  },
  {
    id: "kestrel",
    name: "Kestrel Capital",
    color: "#E8851A",
    haloColor: "rgba(232, 133, 26, 0.28)",
    relX: 0.94,
    relY: 0.58,
  },
  {
    id: "northgate",
    name: "Northgate Bank",
    color: "#881337",
    haloColor: "rgba(136, 19, 55, 0.28)",
    relX: 0.16,
    relY: 0.88,
  },
];

interface NodeData {
  index: number;
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  vx: number;
  vy: number;
  radius: number;
  layer: 0 | 1 | 2;
  parallaxFactor: number;
  ampX: number;
  ampY: number;
  periodX: number;
  periodY: number;
  phaseX: number;
  phaseY: number;
  isBank: boolean;
  bankConfig?: BankNodeConfig;
  flashTimer: number;
  haloCount: number; // For Ring Velocity in Proof state
}

interface EdgeData {
  source: number;
  target: number;
  alphaBucket: number;
}

interface HashPulse {
  id: number;
  path: number[];
  hopIndex: number;
  hopProgress: number;
  currentX: number;
  currentY: number;
  speed: number;
  isVerification: boolean;
  tail: { x: number; y: number }[];
}

interface FloatingHash {
  id: number;
  text: string;
  x: number;
  y: number;
  initialY: number;
  life: number;
  maxLife: number;
}

interface VerificationRing {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

// Problem Fraud Token (Amber dot hopping node-to-node with fiery trail)
interface FraudToken {
  id: number;
  currentNodeIndex: number;
  targetNodeIndex: number;
  progress: number; // 0..1
  currentX: number;
  currentY: number;
  speed: number; // hops per second
  trail: { x: number; y: number; alpha: number }[];
}

function getRandomHex(len: number): string {
  const chars = "0123456789abcdef";
  let str = "";
  for (let i = 0; i < len; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export function MerkleLattice({
  density = 1.0,
  intensity = 1.0,
  paused = false,
  className,
  storyState = "calm",
  scrollProgress = 0,
  scrollY = 0,
  containerRef,
}: MerkleLatticeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const internalWrapperRef = useRef<HTMLDivElement | null>(null);

  // Debug overlay telemetry state
  const [isDebug, setIsDebug] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    fps: number;
    nodes: number;
    edges: number;
    pulses: number;
    story: string;
  }>({
    fps: 60,
    nodes: 72,
    edges: 0,
    pulses: 0,
    story: storyState,
  });

  // Keep ref of storyState & scrollProgress for high-frequency rAF loop
  const storyStateRef = useRef<StoryBackgroundState>(storyState);
  useEffect(() => {
    storyStateRef.current = storyState;
  }, [storyState]);

  const scrollProgressRef = useRef<number>(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDebug(window.location.search.includes("debug=1"));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect capabilities
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Color tokens state
    let isDark = false;
    let primaryRgb = "51, 88, 244"; // #3358F4
    let verifiedRgb = "10, 120, 80"; // #0A7850

    const readThemeTokens = () => {
      if (typeof window === "undefined") return;
      isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark");

      if (isDark) {
        primaryRgb = "108, 134, 255"; // #6C86FF
        verifiedRgb = "52, 211, 153"; // #34D399
      } else {
        primaryRgb = "51, 88, 244"; // #3358F4
        verifiedRgb = "10, 120, 80"; // #0A7850
      }
    };
    readThemeTokens();

    const themeObserver = new MutationObserver(() => {
      readThemeTokens();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // Dimensions & DPR
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Simulation state
    let nodes: NodeData[] = [];
    let edges: EdgeData[] = [];
    let activePulses: HashPulse[] = [];
    let floatingHashes: FloatingHash[] = [];
    let verificationRings: VerificationRing[] = [];
    let fraudTokens: FraudToken[] = [];

    // Story state interpolation variables (600-900ms ease)
    let currentStory = storyStateRef.current;
    let targetStory = storyStateRef.current;
    let transitionProgress = 1.0; // 0..1
    let prevRgb = [51, 88, 244];
    let targetRgb = [51, 88, 244];
    let edgeAlphaMul = 1.0;
    let targetEdgeAlphaMul = 1.0;

    let pulseSpawnTimer = 1.8 + Math.random() * 1.2;
    let verificationTimer = 11.0 + Math.random() * 2.0;
    let governanceSealTimer = 3.5;

    // Pointer state
    let pointerX = -1000;
    let pointerY = -1000;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;
    let pointerActive = false;
    let pointerFadeTimer = 0;

    // Performance & Loop controls
    let rAFId: number = 0;
    let lastTime = performance.now();
    let isVisible = true;
    let isTabActive = true;
    let frameCount = 0;
    let lastFpsCalc = performance.now();
    let measuredFps = 60;

    // Spatial Grid for O(N) neighbour search
    const CELL_SIZE = 150;
    const MAX_EDGE_DIST = 150;
    let gridCols = 1;
    let gridRows = 1;
    let spatialGrid: number[][] = [];

    const initSpatialGrid = () => {
      gridCols = Math.max(1, Math.ceil(width / CELL_SIZE));
      gridRows = Math.max(1, Math.ceil(height / CELL_SIZE));
      spatialGrid = Array.from({ length: gridCols * gridRows }, () => []);
    };

    // Node generation
    const buildNodes = () => {
      nodes = [];
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      let targetCount = isMobile ? 26 : isTablet ? 44 : 72;
      targetCount = Math.round(targetCount * density);

      // 1. Place 5 special Bank Nodes around perimeter
      BANK_CONFIGS.forEach((bCfg, i) => {
        const bx = bCfg.relX * width;
        const by = bCfg.relY * height;
        nodes.push({
          index: i,
          baseX: bx,
          baseY: by,
          currentX: bx,
          currentY: by,
          vx: 0,
          vy: 0,
          radius: isMobile ? 5.5 : 7.0,
          layer: 2,
          parallaxFactor: 1.0,
          ampX: 8 + Math.random() * 6,
          ampY: 8 + Math.random() * 6,
          periodX: 12 + Math.random() * 8,
          periodY: 12 + Math.random() * 8,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          isBank: true,
          bankConfig: bCfg,
          flashTimer: 0,
          haloCount: 0,
        });
      });

      // 2. Poisson-style Jittered Grid for remaining nodes
      const startIdx = nodes.length;
      const remaining = targetCount - startIdx;
      const aspect = width / height;
      const cols = Math.round(Math.sqrt(remaining * aspect));
      const rows = Math.ceil(remaining / cols);
      const stepX = width / (cols + 1);
      const stepY = height / (rows + 1);

      let created = 0;
      for (let r = 1; r <= rows && created < remaining; r++) {
        for (let c = 1; c <= cols && created < remaining; c++) {
          const jitterX = (Math.random() - 0.5) * stepX * 0.75;
          const jitterY = (Math.random() - 0.5) * stepY * 0.75;
          const bx = c * stepX + jitterX;
          const by = r * stepY + jitterY;

          // Avoid placing nodes right behind center headline
          const distToCenter = Math.hypot(bx - width / 2, by - height * 0.35);
          if (distToCenter < 140 && !isMobile) continue;

          const randLayer = Math.random();
          const layer: 0 | 1 | 2 = randLayer < 0.35 ? 0 : randLayer < 0.75 ? 1 : 2;
          const parallaxFactor = layer === 0 ? 0.4 : layer === 1 ? 0.7 : 1.0;
          const radius = layer === 0 ? 1.5 : layer === 1 ? 2.2 : 3.0;

          nodes.push({
            index: startIdx + created,
            baseX: bx,
            baseY: by,
            currentX: bx,
            currentY: by,
            vx: 0,
            vy: 0,
            radius,
            layer,
            parallaxFactor,
            ampX: 6 + Math.random() * 8,
            ampY: 6 + Math.random() * 8,
            periodX: 9 + Math.random() * 11,
            periodY: 9 + Math.random() * 11,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            isBank: false,
            flashTimer: 0,
            haloCount: 0,
          });
          created++;
        }
      }

      initSpatialGrid();
      rebuildEdges();
    };

    // Rebuild edges via Spatial Grid
    const rebuildEdges = () => {
      edges = [];
      spatialGrid.forEach((arr) => (arr.length = 0));

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const col = Math.min(gridCols - 1, Math.max(0, Math.floor(n.currentX / CELL_SIZE)));
        const row = Math.min(gridRows - 1, Math.max(0, Math.floor(n.currentY / CELL_SIZE)));
        spatialGrid[row * gridCols + col].push(i);
      }

      const connectedPairs = new Set<string>();

      for (let i = 0; i < nodes.length; i++) {
        const na = nodes[i];
        const col = Math.min(gridCols - 1, Math.max(0, Math.floor(na.currentX / CELL_SIZE)));
        const row = Math.min(gridRows - 1, Math.max(0, Math.floor(na.currentY / CELL_SIZE)));

        for (let r = Math.max(0, row - 1); r <= Math.min(gridRows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(gridCols - 1, col + 1); c++) {
            const cellNodes = spatialGrid[r * gridCols + c];
            for (let j = 0; j < cellNodes.length; j++) {
              const bIdx = cellNodes[j];
              if (bIdx <= i) continue;

              const nb = nodes[bIdx];
              const dist = Math.hypot(na.currentX - nb.currentX, na.currentY - nb.currentY);
              if (dist <= MAX_EDGE_DIST) {
                const pairKey = `${i}-${bIdx}`;
                if (!connectedPairs.has(pairKey)) {
                  connectedPairs.add(pairKey);
                  const distRatio = dist / MAX_EDGE_DIST;
                  const bucket = Math.min(4, Math.floor((1 - distRatio) * 5));
                  edges.push({ source: i, target: bIdx, alphaBucket: bucket });
                }
              }
            }
          }
        }
      }
    };

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      buildNodes();
    };

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(canvas);
    handleResize();

    // Visibility Observer
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Pointer movement handler
    const targetEl = containerRef?.current || internalWrapperRef.current || canvas;
    const handlePointerMove = (e: PointerEvent) => {
      if (!finePointer || reducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerActive = true;
      pointerFadeTimer = 0.4;

      const normX = (pointerX / width - 0.5) * 2;
      const normY = (pointerY / height - 0.5) * 2;
      targetParallaxX = normX * 14;
      targetParallaxY = normY * 14;
    };

    const handlePointerLeave = () => {
      pointerActive = false;
      targetParallaxX = 0;
      targetParallaxY = 0;
    };

    targetEl.addEventListener("pointermove", handlePointerMove as any, { passive: true });
    targetEl.addEventListener("pointerleave", handlePointerLeave as any);

    // Spawn regular Hash Pulse
    const spawnPulse = (isVerification = false) => {
      if (nodes.length < 5 || activePulses.length >= 3) return;

      const bankIndices = [0, 1, 2, 3, 4].filter((idx) => idx < nodes.length);
      const startNodeIdx = bankIndices[Math.floor(Math.random() * bankIndices.length)];

      const pathLength = 3 + Math.floor(Math.random() * 3);
      const path: number[] = [startNodeIdx];

      let currentIdx = startNodeIdx;
      for (let step = 0; step < pathLength; step++) {
        const neighbours: number[] = [];
        for (let e = 0; e < edges.length; e++) {
          if (edges[e].source === currentIdx) neighbours.push(edges[e].target);
          else if (edges[e].target === currentIdx) neighbours.push(edges[e].source);
        }

        if (neighbours.length === 0) break;
        const nextIdx = neighbours[Math.floor(Math.random() * neighbours.length)];
        path.push(nextIdx);
        currentIdx = nextIdx;
      }

      if (isVerification && path.length > 2) {
        path[path.length - 1] = startNodeIdx;
      }

      if (path.length > 1) {
        activePulses.push({
          id: Math.random(),
          path,
          hopIndex: 0,
          hopProgress: 0,
          currentX: nodes[path[0]].currentX,
          currentY: nodes[path[0]].currentY,
          speed: 220,
          isVerification,
          tail: [],
        });
      }
    };

    // Update Story State Transition Target
    const updateStoryTarget = (st: StoryBackgroundState) => {
      targetStory = st;
      transitionProgress = 0.0;

      if (st === "problem") {
        targetRgb = [217, 119, 6]; // Amber
        targetEdgeAlphaMul = 0.6;
      } else if (st === "solution") {
        targetRgb = isDark ? [108, 134, 255] : [51, 88, 244];
        targetEdgeAlphaMul = 1.4; // Crisp
      } else if (st === "proof") {
        targetRgb = [16, 185, 129]; // Emerald
        targetEdgeAlphaMul = 1.1;
      } else if (st === "governance") {
        targetRgb = [217, 119, 6]; // Gold
        targetEdgeAlphaMul = 0.9;
      } else if (st === "cta") {
        targetRgb = [108, 134, 255]; // Primary-light
        targetEdgeAlphaMul = 0.8;
      } else {
        // Calm
        targetRgb = isDark ? [108, 134, 255] : [51, 88, 244];
        targetEdgeAlphaMul = 1.0;
      }
    };

    // ========================================================
    // MAIN RAF LOOP (Delta Time, Clamped to 50ms)
    // ========================================================
    const renderLoop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      // Telemetry calculation
      frameCount++;
      if (now - lastFpsCalc >= 500) {
        measuredFps = Math.round((frameCount * 1000) / (now - lastFpsCalc));
        frameCount = 0;
        lastFpsCalc = now;
        if (isDebug) {
          setTelemetry({
            fps: measuredFps,
            nodes: nodes.length,
            edges: edges.length,
            pulses: activePulses.length,
            story: currentStory,
          });
        }
      }

      // Check incoming story state
      const nextStoryProp = storyStateRef.current;
      if (nextStoryProp !== targetStory) {
        prevRgb = [
          prevRgb[0] + (targetRgb[0] - prevRgb[0]) * transitionProgress,
          prevRgb[1] + (targetRgb[1] - prevRgb[1]) * transitionProgress,
          prevRgb[2] + (targetRgb[2] - prevRgb[2]) * transitionProgress,
        ];
        updateStoryTarget(nextStoryProp);
      }

      // Interpolate transition progress (600-900ms = dt / 0.75)
      if (transitionProgress < 1.0) {
        transitionProgress = Math.min(1.0, transitionProgress + dt / 0.75);
      } else {
        currentStory = targetStory;
      }

      // Compute current interpolated RGB and alpha
      const tEase =
        transitionProgress < 0.5
          ? 4 * transitionProgress * transitionProgress * transitionProgress
          : 1 - Math.pow(-2 * transitionProgress + 2, 3) / 2;

      const currR = Math.round(prevRgb[0] + (targetRgb[0] - prevRgb[0]) * tEase);
      const currG = Math.round(prevRgb[1] + (targetRgb[1] - prevRgb[1]) * tEase);
      const currB = Math.round(prevRgb[2] + (targetRgb[2] - prevRgb[2]) * tEase);
      const currentRgbStr = `${currR}, ${currG}, ${currB}`;

      edgeAlphaMul = edgeAlphaMul + (targetEdgeAlphaMul - edgeAlphaMul) * 0.08;

      // Handle Reduced Motion static frame
      if (reducedMotion) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Draw static nodes
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.baseX, n.baseY, n.radius, 0, Math.PI * 2);
          if (n.isBank && n.bankConfig) {
            ctx.fillStyle = n.bankConfig.color;
          } else {
            ctx.fillStyle = `rgba(${currentRgbStr}, 0.35)`;
          }
          ctx.fill();
        });

        // Draw static edges
        edges.forEach((e) => {
          const na = nodes[e.source];
          const nb = nodes[e.target];
          ctx.beginPath();
          ctx.moveTo(na.baseX, na.baseY);
          ctx.lineTo(nb.baseX, nb.baseY);
          ctx.strokeStyle = `rgba(${currentRgbStr}, 0.10)`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        });

        ctx.restore();
        return;
      }

      // Only simulate if visible and tab active
      if (isVisible && isTabActive && !paused) {
        // Parallax cursor lerp
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;

        if (pointerFadeTimer > 0) pointerFadeTimer = Math.max(0, pointerFadeTimer - dt);

        // 1. Update Nodes (Sinusoidal orbital drift + Cursor repulsion)
        const timeSec = now / 1000;
        const speedMultiplier = currentStory === "governance" ? 0.6 : 1.0;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const ox = Math.sin(timeSec * (Math.PI * 2 / n.periodX) * speedMultiplier + n.phaseX) * n.ampX;
          const oy = Math.cos(timeSec * (Math.PI * 2 / n.periodY) * speedMultiplier + n.phaseY) * n.ampY;

          let px = n.baseX + ox + currentParallaxX * n.parallaxFactor;
          let py = n.baseY + oy + currentParallaxY * n.parallaxFactor;

          // Cursor repulsion
          if (finePointer && pointerActive) {
            const dx = px - pointerX;
            const dy = py - pointerY;
            const dist = Math.hypot(dx, dy);
            if (dist < 180 && dist > 1) {
              const repelForce = (1 - dist / 180) * 10;
              px += (dx / dist) * repelForce;
              py += (dy / dist) * repelForce;
            }
          }

          n.currentX = px;
          n.currentY = py;

          if (n.flashTimer > 0) n.flashTimer = Math.max(0, n.flashTimer - dt);
        }

        // 2. Pulse Spawning Timer
        pulseSpawnTimer -= dt;
        if (pulseSpawnTimer <= 0) {
          spawnPulse(false);
          pulseSpawnTimer = (currentStory === "proof" ? 1.0 : 2.2) + Math.random() * 1.2;
        }

        // Verification Event Timer
        verificationTimer -= dt;
        if (verificationTimer <= 0) {
          spawnPulse(true);
          verificationTimer = 11.0 + Math.random() * 2.0;
        }

        // Governance Seal Pulsing Timer
        if (currentStory === "governance") {
          governanceSealTimer -= dt;
          if (governanceSealTimer <= 0) {
            verificationRings.push({
              id: Math.random(),
              x: width * 0.5,
              y: height * 0.45,
              radius: 20,
              maxRadius: 280,
              life: 2.4,
              maxLife: 2.4,
              color: "217, 119, 6",
            });
            governanceSealTimer = 3.6;
          }
        }

        // 3. Problem State: Fraud Tokens (hops node-to-node with fiery trails)
        if (currentStory === "problem") {
          // Desired count: 1 token initially, up to 3 as scrollProgress increases
          const desiredCount = scrollProgressRef.current > 0.65 ? 3 : scrollProgressRef.current > 0.35 ? 2 : 1;
          while (fraudTokens.length < desiredCount && nodes.length > 5) {
            const startIdx = Math.floor(Math.random() * 5); // start from bank
            fraudTokens.push({
              id: Math.random(),
              currentNodeIndex: startIdx,
              targetNodeIndex: (startIdx + 1) % nodes.length,
              progress: 0,
              currentX: nodes[startIdx].currentX,
              currentY: nodes[startIdx].currentY,
              speed: 1.2 + Math.random() * 0.4,
              trail: [],
            });
          }

          // Advance fraud tokens
          fraudTokens.forEach((ft) => {
            ft.progress += dt * ft.speed;
            const fromNode = nodes[ft.currentNodeIndex];
            const toNode = nodes[ft.targetNodeIndex];

            if (fromNode && toNode) {
              ft.currentX = fromNode.currentX + (toNode.currentX - fromNode.currentX) * ft.progress;
              ft.currentY = fromNode.currentY + (toNode.currentY - fromNode.currentY) * ft.progress;

              ft.trail.unshift({ x: ft.currentX, y: ft.currentY, alpha: 1.0 });
              if (ft.trail.length > 8) ft.trail.pop();
            }

            if (ft.progress >= 1.0) {
              ft.progress = 0;
              ft.currentNodeIndex = ft.targetNodeIndex;
              // Pick next neighbour
              const neighbours: number[] = [];
              for (let e = 0; e < edges.length; e++) {
                if (edges[e].source === ft.currentNodeIndex) neighbours.push(edges[e].target);
                else if (edges[e].target === ft.currentNodeIndex) neighbours.push(edges[e].source);
              }
              ft.targetNodeIndex = neighbours.length > 0
                ? neighbours[Math.floor(Math.random() * neighbours.length)]
                : (ft.currentNodeIndex + 1) % nodes.length;
            }
          });
        } else {
          // Clear fraud tokens when not in problem
          if (fraudTokens.length > 0) fraudTokens = [];
        }

        // 4. Update Active Pulses
        for (let p = activePulses.length - 1; p >= 0; p--) {
          const pulse = activePulses[p];
          const fromIdx = pulse.path[pulse.hopIndex];
          const toIdx = pulse.path[pulse.hopIndex + 1];

          if (!nodes[fromIdx] || !nodes[toIdx]) {
            activePulses.splice(p, 1);
            continue;
          }

          const na = nodes[fromIdx];
          const nb = nodes[toIdx];
          const hopDist = Math.hypot(nb.currentX - na.currentX, nb.currentY - na.currentY);
          const hopDuration = Math.max(0.1, hopDist / pulse.speed);

          pulse.hopProgress += dt / hopDuration;

          // Easing
          const eased =
            pulse.hopProgress < 0.5
              ? 2 * pulse.hopProgress * pulse.hopProgress
              : -1 + (4 - 2 * pulse.hopProgress) * pulse.hopProgress;

          pulse.currentX = na.currentX + (nb.currentX - na.currentX) * Math.min(1, Math.max(0, eased));
          pulse.currentY = na.currentY + (nb.currentY - na.currentY) * Math.min(1, Math.max(0, eased));

          pulse.tail.unshift({ x: pulse.currentX, y: pulse.currentY });
          if (pulse.tail.length > 5) pulse.tail.pop();

          if (pulse.hopProgress >= 1) {
            pulse.hopProgress = 0;
            pulse.hopIndex++;

            nb.flashTimer = 0.5;
            if (currentStory === "proof" && nb.isBank) {
              nb.haloCount = Math.min(4, nb.haloCount + 1);
            }

            if (pulse.hopIndex >= pulse.path.length - 1) {
              // Pulse finished
              if (pulse.isVerification) {
                verificationRings.push({
                  id: Math.random(),
                  x: nb.currentX,
                  y: nb.currentY,
                  radius: nb.radius,
                  maxRadius: 80,
                  life: 0.7,
                  maxLife: 0.7,
                  color: verifiedRgb,
                });
              } else {
                floatingHashes.push({
                  id: Math.random(),
                  text: `0x${getRandomHex(4)}…${getRandomHex(4)}`,
                  x: nb.currentX,
                  y: nb.currentY - 10,
                  initialY: nb.currentY - 10,
                  life: 1.4,
                  maxLife: 1.4,
                });
              }
              activePulses.splice(p, 1);
            }
          }
        }

        // 5. Update Floating Hashes & Rings
        for (let h = floatingHashes.length - 1; h >= 0; h--) {
          floatingHashes[h].life -= dt;
          floatingHashes[h].y -= dt * 15;
          if (floatingHashes[h].life <= 0) floatingHashes.splice(h, 1);
        }

        for (let r = verificationRings.length - 1; r >= 0; r--) {
          const ring = verificationRings[r];
          ring.life -= dt;
          const prog = 1 - ring.life / ring.maxLife;
          ring.radius = ring.maxRadius * prog;
          if (ring.life <= 0) verificationRings.splice(r, 1);
        }
      }

      // ========================================================
      // DRAW CANVAS
      // ========================================================
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // In CTA state, subtle dark overlay behind lattice
      if (currentStory === "cta") {
        ctx.fillStyle = `rgba(14, 19, 48, ${0.4 * tEase})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Edges Batched by Alpha Bucket
      const bucketAlphas = [0.03, 0.06, 0.09, 0.13, 0.18];
      for (let b = 0; b < 5; b++) {
        const baseAlpha = bucketAlphas[b] * intensity * edgeAlphaMul;
        ctx.beginPath();
        for (let e = 0; e < edges.length; e++) {
          if (edges[e].alphaBucket === b) {
            const na = nodes[edges[e].source];
            const nb = nodes[edges[e].target];
            ctx.moveTo(na.currentX, na.currentY);
            ctx.lineTo(nb.currentX, nb.currentY);
          }
        }
        ctx.strokeStyle = `rgba(${currentRgbStr}, ${baseAlpha.toFixed(3)})`;
        ctx.lineWidth = currentStory === "solution" ? 0.95 : 0.75;
        ctx.stroke();
      }

      // Solution State: Draw Miniature Merkle Tree in canvas background
      if (currentStory === "solution") {
        const treeRootX = width * 0.82;
        const treeRootY = height * 0.28;
        const treeAlpha = 0.55 * tEase;

        ctx.save();
        // Glow root
        const rootGrad = ctx.createRadialGradient(treeRootX, treeRootY, 2, treeRootX, treeRootY, 24);
        rootGrad.addColorStop(0, `rgba(217, 119, 6, ${0.4 * treeAlpha})`);
        rootGrad.addColorStop(1, "transparent");
        ctx.fillStyle = rootGrad;
        ctx.beginPath();
        ctx.arc(treeRootX, treeRootY, 24, 0, Math.PI * 2);
        ctx.fill();

        // Tree branches
        const l1LeftX = treeRootX - 44;
        const l1RightX = treeRootX + 44;
        const l1Y = treeRootY + 36;

        ctx.strokeStyle = `rgba(${currentRgbStr}, ${0.35 * treeAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(treeRootX, treeRootY);
        ctx.lineTo(l1LeftX, l1Y);
        ctx.moveTo(treeRootX, treeRootY);
        ctx.lineTo(l1RightX, l1Y);

        const leaves = [
          { x: l1LeftX - 22, y: l1Y + 36, label: "0x19a9" },
          { x: l1LeftX + 22, y: l1Y + 36, label: "0x42f7" },
          { x: l1RightX - 22, y: l1Y + 36, label: "0x88c2" },
          { x: l1RightX + 22, y: l1Y + 36, label: "0x0f5b" },
        ];

        ctx.moveTo(l1LeftX, l1Y);
        ctx.lineTo(leaves[0].x, leaves[0].y);
        ctx.moveTo(l1LeftX, l1Y);
        ctx.lineTo(leaves[1].x, leaves[1].y);
        ctx.moveTo(l1RightX, l1Y);
        ctx.lineTo(leaves[2].x, leaves[2].y);
        ctx.moveTo(l1RightX, l1Y);
        ctx.lineTo(leaves[3].x, leaves[3].y);
        ctx.stroke();

        // Draw tree nodes
        ctx.fillStyle = "#D97706";
        ctx.beginPath();
        ctx.arc(treeRootX, treeRootY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${currentRgbStr}, 0.8)`;
        ctx.beginPath();
        ctx.arc(l1LeftX, l1Y, 3, 0, Math.PI * 2);
        ctx.arc(l1RightX, l1Y, 3, 0, Math.PI * 2);
        ctx.fill();

        leaves.forEach((lf) => {
          ctx.beginPath();
          ctx.arc(lf.x, lf.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${currentRgbStr}, 0.7)`;
          ctx.fill();

          ctx.font = "8px Geist Mono, monospace";
          ctx.fillStyle = `rgba(${currentRgbStr}, ${0.45 * treeAlpha})`;
          ctx.textAlign = "center";
          ctx.fillText(lf.label, lf.x, lf.y + 12);
        });

        ctx.restore();
      }

      // Draw Cursor interactive edges
      if (finePointer && pointerActive && pointerFadeTimer > 0) {
        const sorted = [...nodes]
          .map((n) => ({ n, dist: Math.hypot(n.currentX - pointerX, n.currentY - pointerY) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3);

        const edgeAlpha = (pointerFadeTimer / 0.4) * 0.4;
        ctx.beginPath();
        sorted.forEach(({ n }) => {
          ctx.moveTo(pointerX, pointerY);
          ctx.lineTo(n.currentX, n.currentY);
        });
        ctx.strokeStyle = `rgba(${currentRgbStr}, ${edgeAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Standard Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.isBank) continue;

        let nodeAlpha = isDark ? 0.35 : 0.28;
        if (finePointer && pointerActive) {
          const dist = Math.hypot(n.currentX - pointerX, n.currentY - pointerY);
          if (dist < 180) {
            nodeAlpha = Math.min(0.7, nodeAlpha + (1 - dist / 180) * 0.45);
          }
        }
        if (n.flashTimer > 0) {
          nodeAlpha = Math.min(1.0, nodeAlpha + (n.flashTimer / 0.5) * 0.5);
        }

        ctx.beginPath();
        ctx.arc(n.currentX, n.currentY, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentRgbStr}, ${nodeAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // Draw Special Bank Nodes (5 perimeter nodes)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.isBank || !n.bankConfig) continue;

        // Halo
        ctx.beginPath();
        ctx.arc(n.currentX, n.currentY, n.radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = n.bankConfig.haloColor;
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(n.currentX, n.currentY, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.bankConfig.color;
        ctx.fill();

        // Flash Ring on Pulse Arrival
        if (n.flashTimer > 0) {
          const ringAlpha = (n.flashTimer / 0.5) * 0.7;
          ctx.beginPath();
          ctx.arc(n.currentX, n.currentY, n.radius + 12 * (1 - n.flashTimer / 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha.toFixed(2)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Proof State: Draw Halo Hit Counter ("+1", "+2", etc.)
        if (currentStory === "proof" && n.haloCount > 0) {
          ctx.font = "bold 9px Geist Sans, sans-serif";
          ctx.fillStyle = "#10B981";
          ctx.textAlign = "center";
          ctx.fillText(`+${n.haloCount}`, n.currentX, n.currentY - n.radius - 8);
        }
      }

      // Draw Problem State: Fraud Tokens (Hopping amber dots with fading trails)
      if (currentStory === "problem") {
        fraudTokens.forEach((ft) => {
          // Trail
          for (let t = 0; t < ft.trail.length; t++) {
            const tr = ft.trail[t];
            const trAlpha = (1 - t / ft.trail.length) * 0.6;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, Math.max(1, 3 - t * 0.3), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${trAlpha.toFixed(2)})`;
            ctx.fill();
          }

          // Main hopping dot
          ctx.beginPath();
          ctx.arc(ft.currentX, ft.currentY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#F59E0B";
          ctx.shadowColor = "#F59E0B";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // Draw Active Hash Pulses
      for (let p = 0; p < activePulses.length; p++) {
        const pulse = activePulses[p];
        const pulseRgb = pulse.isVerification ? verifiedRgb : currentRgbStr;

        // Comet Tail
        for (let t = 0; t < pulse.tail.length; t++) {
          const pt = pulse.tail[t];
          const tailAlpha = (1 - (t + 1) / (pulse.tail.length + 1)) * 0.45;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(1, 4 - t * 0.7), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pulseRgb}, ${tailAlpha.toFixed(3)})`;
          ctx.fill();
        }

        // Glowing Head Dot
        ctx.beginPath();
        ctx.arc(pulse.currentX, pulse.currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${pulseRgb})`;
        ctx.shadowColor = `rgb(${pulseRgb})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Verification Rings & Governance Seals
      for (let r = 0; r < verificationRings.length; r++) {
        const ring = verificationRings[r];
        const ringAlpha = (ring.life / ring.maxLife) * 0.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.color}, ${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.75;
        ctx.stroke();

        // Governance seal concentric secondary ring
        if (currentStory === "governance") {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, Math.max(1, ring.radius - 12), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${ring.color}, ${(ringAlpha * 0.6).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw Floating Monospace Hash Fragments
      for (let h = 0; h < floatingHashes.length; h++) {
        const hash = floatingHashes[h];
        const hashAlpha = (hash.life / hash.maxLife) * 0.45;
        ctx.font = "10px Geist Mono, monospace";
        ctx.fillStyle = `rgba(${currentRgbStr}, ${hashAlpha.toFixed(3)})`;
        ctx.textAlign = "center";
        ctx.fillText(hash.text, hash.x, hash.y);
      }

      ctx.restore();

      // Loop
      rAFId = requestAnimationFrame(renderLoop);
    };

    rAFId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rAFId);
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      targetEl.removeEventListener("pointermove", handlePointerMove as any);
      targetEl.removeEventListener("pointerleave", handlePointerLeave as any);
    };
  }, [density, intensity, paused, containerRef, isDebug]);

  // Parallax speed 0.4 relative to scroll
  const parallaxOffset = scrollY * 0.4;

  return (
    <div
      ref={internalWrapperRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden select-none",
        className
      )}
      style={{
        maskImage:
          "radial-gradient(ellipse 900px 520px at 50% 36%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 900px 520px at 50% 36%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)",
      }}
    >
      <div
        className="w-full h-full will-change-transform"
        style={{
          transform: `translate3d(0, -${parallaxOffset % 600}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Debug Overlay (?debug=1) */}
      {isDebug && (
        <div className="absolute bottom-4 left-4 z-50 rounded-card bg-surface/90 border border-hairline p-3 font-mono text-[11px] text-ink backdrop-blur shadow-card pointer-events-auto">
          <div className="font-bold text-primary mb-1">MerkleLattice Telemetry</div>
          <div>FPS: {telemetry.fps}</div>
          <div>Nodes: {telemetry.nodes}</div>
          <div>Edges: {telemetry.edges}</div>
          <div>Pulses: {telemetry.pulses}</div>
          <div>Story State: <span className="font-bold text-semantic-verified">{telemetry.story}</span></div>
        </div>
      )}
    </div>
  );
}

export default MerkleLattice;
