"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "./ui/button";
import { Shield, ArrowRight, ArrowLeft, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  route?: string;
  anchorPosition?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "step-screen",
    targetId: "nav-screen",
    title: "1. Screen Applicant (Zero-Knowledge)",
    description: "Evaluate borrower identities using client-side Groth16 zk-SNARKs. The raw PAN/Aadhaar never leaves your browser.",
    route: "/bank/meridian/screen",
  },
  {
    id: "step-flag",
    targetId: "nav-flag",
    title: "2. Flag Confirmed Fraudster",
    description: "Commit verified fraudulent identities to the consortium Merkle tree with a 0.05 ETH economic stake to prevent false flags.",
    route: "/bank/meridian/flag",
  },
  {
    id: "step-network",
    targetId: "nav-network",
    title: "3. Consortium Ledger & Topology",
    description: "Monitor real-time syndicate rings, cross-bank velocity hit graphs, and depth-20 Merkle tree transitions.",
    route: "/network",
  },
  {
    id: "step-appeals",
    targetId: "nav-appeals",
    title: "4. Decentralized Appeals DAO",
    description: "Review contested identity flags and vote with an 80% supermajority quorum to maintain protocol integrity.",
    route: "/appeals",
  },
];

export function launchGuidedTour() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kavach_tour_v1");
    window.dispatchEvent(new CustomEvent("kavach:start-tour"));
  }
}

export function GuidedTour() {
  const router = useRouter();
  const params = useParams();
  const bankId = typeof params.id === "string" ? params.id : "meridian";

  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const handleStart = () => {
      setCurrentStepIdx(0);
      setIsActive(true);
    };

    window.addEventListener("kavach:start-tour", handleStart);

    // Check if first-run
    const hasSeenTour = localStorage.getItem("kavach_tour_v1");
    if (!hasSeenTour) {
      // Auto-launch after 1s on initial visit
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("kavach:start-tour", handleStart);
      };
    }

    return () => {
      window.removeEventListener("kavach:start-tour", handleStart);
    };
  }, []);

  if (!isActive) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      if (TOUR_STEPS[nextIdx].route) {
        router.push(TOUR_STEPS[nextIdx].route!);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (TOUR_STEPS[prevIdx].route) {
        router.push(TOUR_STEPS[prevIdx].route!);
      }
    }
  };

  const handleComplete = () => {
    localStorage.setItem("kavach_tour_v1", "true");
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Dimmed Backdrop with hole or soft focus */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-auto transition-opacity animate-fade-in"
        onClick={handleComplete}
      />

      {/* Popover Coach-Mark Card */}
      <div
        role="dialog"
        aria-label="Guided First-Run Tour"
        className="relative z-50 pointer-events-auto w-full max-w-md p-6 rounded-2xl bg-surface border-2 border-brand-sapphire shadow-elevated space-y-4 animate-scale-up"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-brand-sapphire">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              Consortium Guided Walkthrough
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="p-1 rounded text-muted hover:text-ink transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-serif text-heading-md font-medium text-ink">
            {currentStep.title}
          </h4>
          <p className="text-body-sm text-muted leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Progress Dots and Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-hairline">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === currentStepIdx
                    ? "w-6 bg-brand-sapphire"
                    : "w-1.5 bg-muted/30"
                )}
              />
            ))}
            <span className="ml-2 text-[10px] font-mono text-muted">
              {currentStepIdx + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs gap-1 h-8 min-h-[36px]"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs gap-1.5 bg-brand-sapphire text-white h-8 min-h-[36px]"
            >
              {currentStepIdx < TOUR_STEPS.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-3 w-3" />
                </>
              ) : (
                "Finish tour"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

