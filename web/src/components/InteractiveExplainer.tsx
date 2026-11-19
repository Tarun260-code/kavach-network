"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusPill, HashChip, Input, Label } from "@/components/ui";
import { Term } from "@/components/Term";
import { computeLeaf, normaliseId } from "@kavach/prover";
import { deploymentConfig } from "@/lib/deploymentConfig";
import {
  Lock,
  Layers,
  Shield,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InteractiveExplainer() {
  const [demoInput, setDemoInput] = useState("BKUPG8492Q");
  const [computedLeaf, setComputedLeaf] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    let active = true;
    const calculateHash = async () => {
      if (!demoInput.trim()) {
        setComputedLeaf("");
        return;
      }

      setIsHashing(true);
      try {
        const norm = normaliseId(demoInput.trim().toUpperCase());
        const salt = BigInt(deploymentConfig.consortiumSalt || "888777666555444333222111000999");
        const leafBig = await computeLeaf(norm, salt);
        if (active) {
          setComputedLeaf("0x" + leafBig.toString(16).padStart(64, "0"));
        }
      } catch {
        if (active) setComputedLeaf("");
      } finally {
        if (active) setIsHashing(false);
      }
    };

    calculateHash();
    return () => {
      active = false;
    };
  }, [demoInput]);

  const steps = [
    {
      step: 1,
      title: "Input in local browser RAM",
      description:
        "The loan underwriter enters the national identifier on their secure internal workstation. The raw identifier stays exclusively inside local browser memory.",
      tag: "Zero Network Broadcast",
      icon: Lock,
    },
    {
      step: 2,
      title: "One-way Poseidon hashing",
      description:
        "The identifier is combined with the high-entropy consortium salt and hashed across a 254-bit scalar field using Poseidon-T3. The operation cannot be mathematically inverted.",
      tag: "BN254 Scalar Field",
      icon: Terminal,
    },
    {
      step: 3,
      title: "On-chain commitment leaf",
      description:
        "Only the resulting 32-byte hash and a 0.05 ETH collateral stake are sent to Ethereum FraudRegistry.sol. No names, dates, or cleartext digits ever touch the chain.",
      tag: "32 Bytes Only",
      icon: Layers,
    },
    {
      step: 4,
      title: "Zero-knowledge verification",
      description:
        "When another member bank evaluates an applicant, their browser generates a Groth16 zero-knowledge proof. A match is verified without revealing WHO matched or WHICH leaf was queried.",
      tag: "Groth16 zk-SNARK",
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-12">
      {/* 4-Step Walkthrough Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          return (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={cn(
                "p-6 rounded-card border transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none",
                isActive
                  ? "bg-surface border-brand-sapphire shadow-card ring-1 ring-brand-sapphire/30"
                  : "bg-surface/60 border-hairline hover:border-hairline hover:bg-surface shadow-subtle"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-muted">
                    0{s.step}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
                    {s.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-brand-sapphire text-white"
                        : "bg-subtle text-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-ink">
                    {s.title}
                  </h4>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-[11px] text-muted">
                <span>Phase {s.step} of 4</span>
                {isActive && (
                  <span className="text-brand-sapphire font-semibold flex items-center gap-1">
                    <span>Active</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tiny Live Interactive Demo Widget */}
      <Card className="p-6 sm:p-8 bg-surface border-hairline shadow-card space-y-6">
        <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              <span className="text-eyebrow font-medium uppercase tracking-wider text-muted">
                Interactive Proof Demonstration
              </span>
            </div>
            <h3 className="font-serif text-heading-md text-ink font-normal mt-1">
              Try the one-way commitment transform live
            </h3>
            <p className="text-body-sm text-muted">
              Type any PAN, national ID, or text below. Watch your browser calculate its exact 32-byte cryptographic leaf in real time.
            </p>
          </div>

          <StatusPill variant="verified" size="default" label="Client-Side In-RAM" pulse />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Input Text Field */}
          <div className="lg:col-span-5 space-y-3">
            <Label htmlFor="interactive-demo-input" className="text-xs">
              Type any national identifier or test value:
            </Label>
            <Input
              id="interactive-demo-input"
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder="e.g. BKUPG8492Q or any test phrase"
              className="font-mono text-sm tracking-wide"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted">Quick test presets:</span>
              <button
                type="button"
                onClick={() => setDemoInput("BKUPG8492Q")}
                className="text-xs font-mono text-brand-sapphire hover:underline"
              >
                BKUPG8492Q
              </button>
              <span className="text-hairline">•</span>
              <button
                type="button"
                onClick={() => setDemoInput("KRNPA1092F")}
                className="text-xs font-mono text-brand-sapphire hover:underline"
              >
                KRNPA1092F
              </button>
              <span className="text-hairline">•</span>
              <button
                type="button"
                onClick={() => setDemoInput("Pooja Sharma")}
                className="text-xs font-mono text-brand-sapphire hover:underline"
              >
                Custom Name
              </button>
            </div>
          </div>

          {/* Center: Cryptographic Transform Arrow */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-2">
            <div className="text-[10px] font-mono text-muted mb-1 uppercase tracking-wider">
              Poseidon-T3(ID, Salt)
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle border border-hairline text-ink">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="text-[10px] font-mono text-semantic-verified mt-1">
              {isHashing ? "Computing..." : "254-bit BN254"}
            </div>
          </div>

          {/* Right: Output Hash Leaf & The Punchline */}
          <div className="lg:col-span-5 p-5 rounded-card bg-subtle/50 border border-hairline space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Consortium <Term id="leaf">Merkle Leaf</Term> Output</span>
              <span className="font-mono text-[11px] text-muted">32 Bytes</span>
            </div>

            <div className="p-3 rounded-card bg-surface border border-brand-sapphire/30 font-mono text-xs text-ink break-all select-all shadow-subtle">
              {computedLeaf || "0x0000000000000000000000000000000000000000000000000000000000000000"}
            </div>

            <div className="p-3 rounded-card bg-semantic-verified/10 border border-semantic-verified/25 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-semantic-verified shrink-0 mt-0.5" />
              <p className="text-xs text-ink font-semibold leading-relaxed">
                &ldquo;This is all the chain ever sees.&rdquo;
                <span className="block text-[11px] font-normal text-muted mt-0.5">
                  Your input text never leaves this browser. The 32-byte leaf cannot be reversed to reveal what you typed.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

