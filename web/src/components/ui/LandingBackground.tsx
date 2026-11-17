"use client";

import React, { useState, useEffect, useRef } from "react";
import { MeshBackground, StoryBackgroundState } from "./MeshBackground";
import { MerkleLattice } from "./MerkleLattice";
import { FloatingHashChips } from "./FloatingHashChips";

export interface LandingBackgroundProps {
  className?: string;
}

const SECTION_STORY_MAP: Record<string, StoryBackgroundState> = {
  hero: "calm",
  problem: "problem",
  "how-it-works": "solution",
  "syndicate-velocity": "proof",
  governance: "governance",
  cta: "cta",
};

export function LandingBackground({ className }: LandingBackgroundProps) {
  const [activeStory, setActiveStory] = useState<StoryBackgroundState>("calm");
  const [sectionProgress, setSectionProgress] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);

  // Parallax Scroll Tracking (throttled with rAF)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rAFId = 0;
    const handleScroll = () => {
      if (rAFId) return;
      rAFId = requestAnimationFrame(() => {
        rAFId = 0;
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  // IntersectionObserver for Section-Aware Story Tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sectionIds = ["hero", "problem", "how-it-works", "syndicate-velocity", "governance", "cta"];
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries sorted by intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const topVisible = visible[0];
          const matchedStory = SECTION_STORY_MAP[topVisible.target.id];
          if (matchedStory) {
            setActiveStory(matchedStory);
            setSectionProgress(topVisible.intersectionRatio);
          }
        }
      },
      {
        rootMargin: "-15% 0px -25% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75, 0.9],
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* 1. Aurora Mesh Layer (Parallax 0.2) */}
      <MeshBackground
        variant="hero"
        storyState={activeStory}
        scrollY={scrollY}
      />

      {/* 2. Living Merkle Lattice Layer (Parallax 0.4) */}
      <MerkleLattice
        storyState={activeStory}
        scrollProgress={sectionProgress}
        scrollY={scrollY}
      />

      {/* 3. Floating Glass Hash Chips Layer (Parallax 0.6) */}
      <FloatingHashChips scrollY={scrollY} />
    </div>
  );
}

export default LandingBackground;
