"use client";

import React, { useState } from "react";
import {
  MetricCard,
  HashChip,
  StatusPill,
  Card,
  Button,
  BankMonogram,
} from "@/components/ui";
import {
  Brain,
  Activity,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Server,
  Layers,
  Lock,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalBankModel {
  bankName: string;
  bankCode: string;
  sampleCount: number;
  specialization: string;
  weights: [number, number, number, number];
  lossHistory: number[];
}

export function FederatedSimulationView() {
  const [selectedRound, setSelectedRound] = useState<number>(5);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ round: number; globalLoss: number } | null>(null);

  // Risk test sliders
  const [testInquiryVelocity, setTestInquiryVelocity] = useState<number>(3);
  const [testSyntheticScore, setTestSyntheticScore] = useState<number>(45);
  const [testCircularTx, setTestCircularTx] = useState<number>(20);

  // 3 Local Bank Models on Synthetic Data
  const localBanks: LocalBankModel[] = [
    {
      bankName: "Meridian Bank",
      bankCode: "MB",
      sampleCount: 18450,
      specialization: "Multi-Lender Unsecured Personal Loan Velocity",
      weights: [1.68, 1.05, 0.82, 1.25],
      lossHistory: [0.55, 0.44, 0.35, 0.28, 0.21, 0.17, 0.14, 0.12, 0.11, 0.09],
    },
    {
      bankName: "Halcyon Bank",
      bankCode: "HA",
      sampleCount: 16200,
      specialization: "Aadhaar e-KYC Offline XML Tampering & Smurfing",
      weights: [1.25, 1.48, 0.91, 1.12],
      lossHistory: [0.52, 0.41, 0.32, 0.25, 0.19, 0.15, 0.13, 0.11, 0.10, 0.08],
    },
    {
      bankName: "Aurum Bank",
      bankCode: "AU",
      sampleCount: 12100,
      specialization: "Circular GST Invoicing & Fake Shell Company Accounts",
      weights: [1.18, 0.94, 1.42, 1.45],
      lossHistory: [0.58, 0.47, 0.38, 0.30, 0.23, 0.18, 0.15, 0.13, 0.11, 0.09],
    },
  ];

  // Global Consensus Model History across 10 rounds
  const globalLossHistory = [0.55, 0.43, 0.33, 0.26, 0.20, 0.16, 0.13, 0.11, 0.10, 0.08];
  const globalAccuracyHistory = [74.2, 79.5, 84.1, 88.0, 91.4, 93.8, 95.2, 96.4, 97.1, 97.8];

  const currentLoss = globalLossHistory[selectedRound - 1] ?? 0.20;
  const currentAccuracy = globalAccuracyHistory[selectedRound - 1] ?? 91.4;

  // Logistic Sigmoid for simulated prediction
  const logit =
    (testInquiryVelocity / 5) * 1.5 * 2.5 +
    (testSyntheticScore / 100) * 1.2 * 2.2 +
    (testCircularTx / 100) * 1.0 * 2.0 -
    3.2;
  const predictedProbability = Number((1 / (1 + Math.exp(-logit))).toFixed(3));
  const isHighRisk = predictedProbability > 0.60;

  return (
    <div className="space-y-6 text-left">
      {/* Permanent "Simulation" Banner — Never Imply Production */}
      <Card className="p-4 bg-semantic-pending/10 border-semantic-pending/30 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-semantic-pending/20 text-[#925B00] dark:text-[#F5B544]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#925B00] dark:text-[#F5B544] px-2 py-0.5 rounded-pill bg-semantic-pending/20">
                Simulation Prototype &bull; Not Production
              </span>
              <StatusPill variant="pending" size="sm" label="Local RAM Model" />
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Demonstrates federated learning (FedAvg) over synthetic lender models. Client data never leaves institution premises; only mathematical gradient weights are aggregated.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRound(5)}
            className="text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </Card>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active round"
          value={`Round #${selectedRound}`}
          sublabel="Aggregated weight vector"
          icon={<Layers className="h-4 w-4 text-brand-sapphire" />}
        />

        <MetricCard
          label="Local bank models"
          value="3 Institutions"
          sublabel="46,750 synthetic training loans"
          icon={<Server className="h-4 w-4 text-semantic-verified" />}
        />

        <MetricCard
          label="Consortium AUC-ROC"
          value={`${currentAccuracy}%`}
          sublabel="+7.4% vs isolated single-bank model"
          icon={<TrendingUp className="h-4 w-4 text-brand-gold" />}
        />

        <MetricCard
          label="PII transferred"
          value="0.00 KB"
          sublabel="Zero customer record pooling"
          icon={<Lock className="h-4 w-4 text-semantic-verified" />}
        />
      </div>

      {/* Main Grid: FedAvg Chart & Controls (7 Cols) + 3 Local Models & Risk Predictor (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FedAvg Rounds Chart & Round Slider (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card elevation="card" className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
              <div>
                <h3 className="font-serif text-2xl text-ink font-normal tracking-tight">
                  FedAvg Convergence Chart
                </h3>
                <p className="text-body-sm text-muted mt-0.5">
                  Primary line shows global model loss. Thin lines represent local bank iterations.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-muted">Round {selectedRound} Loss:</span>
                <span className="font-bold text-ink tabular-nums">{currentLoss.toFixed(3)}</span>
              </div>
            </div>

            {/* SVG FedAvg Chart (2px line, 8% fill, hairline horizontals only, tabular figures) */}
            <div className="space-y-3">
              <div className="sr-only">
                Federated Averaging convergence chart showing loss decreasing from 0.55 in round 1 to 0.08 in round 10 across 3 banks. Selected round is {selectedRound}.
              </div>

              <div className="h-48 w-full rounded-panel bg-subtle/30 p-4 border border-hairline relative select-none">
                <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="globalLossArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-sapphire)" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="var(--brand-sapphire)" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Hairline Horizontals Only */}
                  <line x1="20" y1="20" x2="480" y2="20" stroke="var(--hairline)" strokeWidth="1" />
                  <line x1="20" y1="60" x2="480" y2="60" stroke="var(--hairline)" strokeWidth="1" />
                  <line x1="20" y1="100" x2="480" y2="100" stroke="var(--hairline)" strokeWidth="1" />

                  {/* Thin Lines: 3 Local Banks (1px, lower opacity) */}
                  {localBanks.map((b, bIdx) => {
                    const pts = b.lossHistory
                      .map((val, i) => {
                        const x = (i / (b.lossHistory.length - 1)) * 460 + 20;
                        const y = 100 - (1 - val / 0.6) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ");

                    const bankColors = ["#0E9F9F", "#0B4A72", "#A9822F"];
                    return (
                      <polyline
                        key={b.bankCode}
                        fill="none"
                        stroke={bankColors[bIdx]}
                        strokeWidth="1"
                        strokeOpacity="0.5"
                        strokeDasharray="2 2"
                        points={pts}
                      />
                    );
                  })}

                  {/* Primary Line Area Fill (8% opacity) */}
                  <polygon
                    fill="url(#globalLossArea)"
                    points={`20,100 ${globalLossHistory
                      .map((val, i) => {
                        const x = (i / (globalLossHistory.length - 1)) * 460 + 20;
                        const y = 100 - (1 - val / 0.6) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ")} 480,100`}
                  />

                  {/* Primary Line: Global Consensus Model (2px line) */}
                  <polyline
                    fill="none"
                    stroke="var(--brand-sapphire)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={globalLossHistory
                      .map((val, i) => {
                        const x = (i / (globalLossHistory.length - 1)) * 460 + 20;
                        const y = 100 - (1 - val / 0.6) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {/* Nodes & Active Round Indicator */}
                  {globalLossHistory.map((val, i) => {
                    const x = (i / (globalLossHistory.length - 1)) * 460 + 20;
                    const y = 100 - (1 - val / 0.6) * 80;
                    const isSelected = selectedRound === i + 1;

                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 6 : 3}
                          fill={isSelected ? "var(--brand-sapphire)" : "var(--surface)"}
                          stroke="var(--brand-sapphire)"
                          strokeWidth="2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint({ round: i + 1, globalLoss: val })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => setSelectedRound(i + 1)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Card-Styled Tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-3 right-4 p-2.5 rounded-card bg-surface border border-hairline shadow-elevated text-xs font-mono space-y-0.5">
                    <span className="text-muted block text-[10px]">Consensus Round #{hoveredPoint.round}</span>
                    <span className="text-ink font-bold block tabular-nums">Loss: {hoveredPoint.globalLoss.toFixed(3)}</span>
                  </div>
                )}
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-muted pt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <span className="h-0.5 w-4 bg-brand-sapphire inline-block" />
                    <span>Global Consensus (2px)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-[#0E9F9F] border-b border-dashed inline-block" />
                    <span>Meridian</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-[#0B4A72] border-b border-dashed inline-block" />
                    <span>Halcyon</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-[#A9822F] border-b border-dashed inline-block" />
                    <span>Aurum</span>
                  </span>
                </div>
                <span className="font-mono text-faint">Tabular figures &bull; 8% fill</span>
              </div>
            </div>

            {/* Round Slider Control */}
            <div className="space-y-2 pt-3 border-t border-hairline">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="round-slider" className="font-semibold text-ink">
                  Simulation Round Slider: <strong className="text-brand-sapphire font-mono">Round #{selectedRound} of 10</strong>
                </label>
                <span className="text-[11px] font-mono text-muted">
                  Accuracy: <strong className="text-ink font-mono tabular-nums">{currentAccuracy}%</strong>
                </span>
              </div>
              <input
                id="round-slider"
                type="range"
                min="1"
                max="10"
                step="1"
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="w-full h-2 bg-subtle rounded-pill appearance-none cursor-pointer accent-brand-sapphire"
              />
              <div className="flex justify-between text-[10px] font-mono text-faint">
                <span>Round 1 (Cold Start)</span>
                <span>Round 5 (Consensus)</span>
                <span>Round 10 (Convergence)</span>
              </div>
            </div>

            {/* Plain-Language Explainer Box */}
            <div className="p-4 rounded-panel bg-subtle/50 border border-hairline space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <HelpCircle className="h-4 w-4 text-brand-sapphire" />
                <span>How Federated Averaging Protects Privacy</span>
              </div>
              <p className="text-muted leading-relaxed">
                Under the DPDP Act, banks cannot pool customer accounts or cross-border identity registries. Federated learning replaces data pooling with mathematical gradient exchange: each institution trains locally on its encrypted loan outcomes, broadcasting only mathematical weights. Kavach averages these weights across the network to detect emerging fraud rings without any bank exposing who its borrowers are.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: 3 Local Models & Risk Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3 Local Models */}
          <div className="space-y-3">
            <h4 className="font-serif text-xl text-ink font-normal tracking-tight">
              3 Local Bank Models
            </h4>

            <div className="space-y-3">
              {localBanks.map((model) => (
                <div
                  key={model.bankCode}
                  className="p-3.5 rounded-panel bg-surface border border-hairline shadow-subtle space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BankMonogram bankId={model.bankCode.toLowerCase()} size="sm" />
                      <div>
                        <span className="font-semibold text-ink block">{model.bankName}</span>
                        <span className="text-[10px] text-faint font-mono uppercase">{model.bankCode}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-brand-sapphire font-semibold">
                      {model.sampleCount.toLocaleString()} Loans
                    </span>
                  </div>

                  <p className="text-[11px] text-muted truncate">
                    Focus: {model.specialization}
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-hairline font-mono text-[10px]">
                    <div className="p-1.5 rounded bg-subtle/60 text-center">
                      <span className="text-faint block">w₁</span>
                      <span className="font-bold text-ink">{model.weights[0]}</span>
                    </div>
                    <div className="p-1.5 rounded bg-subtle/60 text-center">
                      <span className="text-faint block">w₂</span>
                      <span className="font-bold text-ink">{model.weights[1]}</span>
                    </div>
                    <div className="p-1.5 rounded bg-subtle/60 text-center">
                      <span className="text-faint block">w₃</span>
                      <span className="font-bold text-ink">{model.weights[2]}</span>
                    </div>
                    <div className="p-1.5 rounded bg-subtle/60 text-center">
                      <span className="text-faint block">w₄</span>
                      <span className="font-bold text-ink">{model.weights[3]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Risk Simulator Card */}
          <Card elevation="card" className="p-5 space-y-4 text-xs">
            <div className="border-b border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-sapphire" />
                <h4 className="font-serif text-lg text-ink font-normal">
                  Consensus Risk Simulator
                </h4>
              </div>
              <p className="text-[11px] text-muted mt-0.5">
                Evaluates parameters against Round #{selectedRound} federated consensus weights:
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">Multi-Lender Velocity (&lt;48h)</span>
                  <span className="font-mono text-brand-sapphire font-semibold">{testInquiryVelocity} banks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={testInquiryVelocity}
                  onChange={(e) => setTestInquiryVelocity(Number(e.target.value))}
                  className="w-full h-1.5 bg-subtle rounded-pill appearance-none cursor-pointer accent-brand-sapphire"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">Synthetic Identity Score</span>
                  <span className="font-mono text-brand-sapphire font-semibold">{testSyntheticScore}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={testSyntheticScore}
                  onChange={(e) => setTestSyntheticScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-subtle rounded-pill appearance-none cursor-pointer accent-brand-sapphire"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink font-medium">Circular Invoicing Confidence</span>
                  <span className="font-mono text-brand-sapphire font-semibold">{testCircularTx}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={testCircularTx}
                  onChange={(e) => setTestCircularTx(Number(e.target.value))}
                  className="w-full h-1.5 bg-subtle rounded-pill appearance-none cursor-pointer accent-brand-sapphire"
                />
              </div>
            </div>

            {/* Simulated Outcome */}
            <div className="pt-3 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Consensus Probability:</span>
                <span
                  className={cn(
                    "font-mono text-sm font-bold",
                    isHighRisk ? "text-semantic-flagged" : "text-semantic-verified"
                  )}
                >
                  {(predictedProbability * 100).toFixed(1)}% ({isHighRisk ? "High Risk" : "Low Risk"})
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {isHighRisk
                  ? "Elevated cross-lender syndication score. Triggers mandatory client-side zk-SNARK screening prior to credit approval."
                  : "Within normal consortium velocity bounds. Standard credit underwriting parameters apply."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FederatedSimulationView;
