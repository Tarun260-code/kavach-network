"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  TrendingUp,
  FileCheck2,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  Copy,
  Check,
  Search,
  ChevronRight,
  Database,
  Moon,
  Sun,
  Layout,
  Palette,
  Terminal,
  Activity,
  UserCheck,
  Send,
  Trash2,
  Settings,
} from "lucide-react";

import {
  Button,
  StatusPill,
  HashChip,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Panel,
  Divider,
  Eyebrow,
  SectionHeading,
  MetricCard,
  BankMonogram,
  MeshBackground,
  Badge,
  Input,
  Textarea,
  Select,
  SegmentedControl,
  Slider,
  Switch,
  Checkbox,
  Kbd,
  Stepper,
  Timeline,
  DataTable,
  Column,
  EmptyState,
  Term,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Skeleton,
  SkeletonText,
  SkeletonMetric,
  SkeletonCard,
  SkeletonTable,
  ThemeToggle,
} from "@/components/ui";

export default function StyleguidePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [tabsVariant, setTabsVariant] = useState<"pill" | "underline">("pill");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState(65);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [segmentedVal, setSegmentedVal] = useState("meridian");
  const [btnLoading, setBtnLoading] = useState(false);
  const [tableDensity, setTableDensity] = useState<"comfortable" | "compact">("comfortable");

  // Sample data for DataTable showcase
  interface SampleTx {
    id: string;
    hash: string;
    originator: string;
    amount: string;
    status: "verified" | "flagged" | "review" | "pending";
    timestamp: string;
  }

  const sampleData: SampleTx[] = [
    {
      id: "tx-1",
      hash: "0x19a99ebe9f36b701c10d7a6e1388bf34d31d92a4f49b71e164ef15049b736b04",
      originator: "Meridian Bank",
      amount: "0.05 ETH",
      status: "flagged",
      timestamp: "2 mins ago",
    },
    {
      id: "tx-2",
      hash: "0x82f4c91a0b334e12d59187ec091823761823b123912831823912831823712891",
      originator: "Kestrel Capital",
      amount: "0.05 ETH",
      status: "verified",
      timestamp: "14 mins ago",
    },
    {
      id: "tx-3",
      hash: "0x39a11ef09c12b772a81283120391283019283019283019283019283019283019",
      originator: "Aurum Commercial",
      amount: "0.10 ETH",
      status: "review",
      timestamp: "1 hour ago",
    },
    {
      id: "tx-4",
      hash: "0x77b8192a01923812039128301928301928301928301928301928301928301928",
      originator: "Halcyon Underwriting",
      amount: "0.05 ETH",
      status: "pending",
      timestamp: "3 hours ago",
    },
  ];

  const columns: Column<SampleTx>[] = [
    {
      key: "hash",
      header: "Commitment Leaf",
      render: (row) => <HashChip hash={row.hash} prefixLen={6} suffixLen={4} />,
    },
    {
      key: "originator",
      header: "Originator Node",
      render: (row) => (
        <span className="font-sans font-medium text-ink flex items-center gap-2">
          <BankMonogram bankId={row.originator.toLowerCase().includes("meridian") ? "meridian" : "kestrel"} size="sm" />
          {row.originator}
        </span>
      ),
    },
    {
      key: "status",
      header: "Registry Status",
      render: (row) => <StatusPill variant={row.status} label={row.status} />,
    },
    {
      key: "amount",
      header: "Escrow Stake",
      align: "right",
      isNumeric: true,
      render: (row) => <span className="font-mono text-ink font-medium">{row.amount}</span>,
    },
    {
      key: "timestamp",
      header: "Observed",
      align: "right",
      render: (row) => <span className="font-mono text-faint text-xs">{row.timestamp}</span>,
    },
  ];

  // Contrast pairs data for WCAG AA Audit Table
  const contrastAuditData = [
    { name: "Primary Canvas Ink", fg: "#0E1330", bg: "#F7F9FD", ratioLight: "17.26:1", ratioDark: "17.11:1", status: "PASS (AAA)" },
    { name: "Elevated Card Surface", fg: "#0E1330", bg: "#FFFFFF", ratioLight: "18.19:1", ratioDark: "15.76:1", status: "PASS (AAA)" },
    { name: "Secondary Muted Copy", fg: "#5A6377", bg: "#FFFFFF", ratioLight: "6.02:1", ratioDark: "7.86:1", status: "PASS (AA)" },
    { name: "Primary Sapphire Accent", fg: "#3358F4", bg: "#FFFFFF", ratioLight: "5.46:1", ratioDark: "5.55:1", status: "PASS (AA)" },
    { name: "Primary CTA White Text", fg: "#FFFFFF", bg: "#3358F4", ratioLight: "5.46:1", ratioDark: "6.02:1", status: "PASS (AA)" },
    { name: "Verified Signal (Emerald)", fg: "#0D7A54", bg: "#FFFFFF", ratioLight: "5.25:1", ratioDark: "9.33:1", status: "PASS (AA)" },
    { name: "Flagged Signal (Coral)", fg: "#D6384A", bg: "#FFFFFF", ratioLight: "4.64:1", ratioDark: "6.53:1", status: "PASS (AA)" },
    { name: "Review Signal (Warm Amber)", fg: "#925B00", bg: "#FFFFFF", ratioLight: "5.65:1", ratioDark: "9.89:1", status: "PASS (AA)" },
    { name: "Consortium Gold Seal", fg: "#855D10", bg: "#FFFFFF", ratioLight: "5.88:1", ratioDark: "9.00:1", status: "PASS (AA)" },
  ];

  return (
    <TooltipProvider>
      <div className="relative min-h-screen pb-32 text-ink font-sans selection:bg-brand-sapphire/15 selection:text-ink overflow-x-hidden">
        {/* Ambient Mesh Gradient */}
        <MeshBackground intensity="subtle" />

        {/* Floating Top Bar (12px inset, radius 16, glass restrained) */}
        <header className="sticky top-3 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 rounded-panel glass border border-white/40 dark:border-white/10 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white shadow-subtle">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-heading-md font-medium tracking-tight text-ink">
                  Kavach
                </span>
                <span className="text-body-sm font-normal text-muted">Design System</span>
              </div>
              <span className="ml-2 hidden rounded-pill border border-hairline bg-subtle px-2 py-0.5 font-mono text-[11px] font-semibold text-faint sm:inline-block">
                v2.0 CONSOLIDATED
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">
                  Exit to Portal
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                withOrb={false}
                onClick={() => setDialogOpen(true)}
              >
                Inspect DS
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <main className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow variant="brand" className="mb-3">
              Kavach Design System Architecture
            </Eyebrow>

            <h1 className="font-serif text-display-lg text-ink mb-4">
              Consortium <em>armour</em> for Indian banking
            </h1>

            <p className="text-body-lg text-muted leading-relaxed">
              Consolidated single source of truth in <code className="font-mono text-xs text-ink bg-subtle px-1.5 py-0.5 rounded">@/components/ui</code>.
              Concentric radii hierarchy (24 outer, 16 inner panel, 12 controls, 9999 pills), OKLCH tonal scales,
              strict 4-surface glass constraints, and accessible high-contrast tokens.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#primitives">
                <Button variant="pill-dark" size="default">
                  Explore Primitives
                </Button>
              </a>
              <a href="#contrast-audit">
                <Button variant="pill-light" size="default">
                  Contrast Audit Table
                </Button>
              </a>
              <a href="#dodont">
                <Button variant="ghost" size="default">
                  Do&apos;s and Don&apos;ts
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Jump Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-y border-hairline py-3 text-xs text-muted">
            <span className="font-mono font-semibold uppercase tracking-wider text-faint mr-2">Index:</span>
            <a href="#tokens" className="hover:text-ink transition-colors font-medium">01 Tokens</a>
            <span className="text-hairline">•</span>
            <a href="#contrast-audit" className="hover:text-ink transition-colors font-medium">02 WCAG AA Audit</a>
            <span className="text-hairline">•</span>
            <a href="#buttons" className="hover:text-ink transition-colors font-medium">03 Buttons</a>
            <span className="text-hairline">•</span>
            <a href="#forms" className="hover:text-ink transition-colors font-medium">04 Form Controls</a>
            <span className="text-hairline">•</span>
            <a href="#surfaces" className="hover:text-ink transition-colors font-medium">05 Surfaces & Panels</a>
            <span className="text-hairline">•</span>
            <a href="#data" className="hover:text-ink transition-colors font-medium">06 Data & Feedback</a>
            <span className="text-hairline">•</span>
            <a href="#dodont" className="hover:text-ink transition-colors font-medium">07 Architecture Rules</a>
          </div>

          {/* Section 1: Chromatic Architecture & OKLCH Tonal Scales */}
          <section id="tokens" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>01 / Chromatic Architecture</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Tonal Scales & Semantic Aliases
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                OKLCH 50 → 950 Scales in globals.css
              </span>
            </div>

            {/* Core Surfaces & Text */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {[
                { name: "Canvas", token: "--canvas", hex: "#F7F9FD", bg: "bg-canvas", border: true },
                { name: "Surface", token: "--surface", hex: "#FFFFFF", bg: "bg-surface", border: true },
                { name: "Elevated", token: "--elevated", hex: "#FFFFFF", bg: "bg-surface", border: true },
                { name: "Subtle", token: "--subtle", hex: "#EEF2F9", bg: "bg-subtle", border: true },
                { name: "Ink (Text)", token: "--ink", hex: "#0E1330", bg: "bg-ink", textWhite: true },
                { name: "Muted Text", token: "--muted", hex: "#5A6377", bg: "bg-muted", textWhite: true },
              ].map((c) => (
                <Card key={c.name} elevation="subtle" className="p-3">
                  <div className={`h-14 w-full rounded-input ${c.bg} ${c.border ? "border border-hairline" : ""} flex items-end p-2`}>
                    <span className={`font-mono text-[11px] font-semibold ${c.textWhite ? "text-white" : "text-ink"}`}>
                      {c.hex}
                    </span>
                  </div>
                  <div className="mt-2 text-left">
                    <span className="font-sans text-xs font-semibold text-ink block">{c.name}</span>
                    <span className="font-mono text-[10px] text-faint block">{c.token}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* OKLCH Tonal Scales Visualization */}
            <div className="mt-6 space-y-4">
              <Panel className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Primary Sapphire Scale (OKLCH hue 260)</span>
                  <span className="font-mono text-faint">--primary-50 ... --primary-950</span>
                </div>
                <div className="grid grid-cols-11 gap-1 h-10">
                  {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((step, i) => (
                    <div
                      key={step}
                      className="rounded-sm flex flex-col justify-end p-1 transition-transform hover:scale-105"
                      style={{ backgroundColor: `var(--primary-${step})` }}
                    >
                      <span className={`font-mono text-[9px] ${i > 4 ? "text-white" : "text-ink"}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Verified Emerald Scale (OKLCH hue 155)</span>
                  <span className="font-mono text-faint">--verified-50 ... --verified-950</span>
                </div>
                <div className="grid grid-cols-11 gap-1 h-10">
                  {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((step, i) => (
                    <div
                      key={step}
                      className="rounded-sm flex flex-col justify-end p-1 transition-transform hover:scale-105"
                      style={{ backgroundColor: `var(--verified-${step})` }}
                    >
                      <span className={`font-mono text-[9px] ${i > 4 ? "text-white" : "text-ink"}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Flagged Coral Scale (OKLCH hue 25)</span>
                  <span className="font-mono text-faint">--flagged-50 ... --flagged-950</span>
                </div>
                <div className="grid grid-cols-11 gap-1 h-10">
                  {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((step, i) => (
                    <div
                      key={step}
                      className="rounded-sm flex flex-col justify-end p-1 transition-transform hover:scale-105"
                      style={{ backgroundColor: `var(--flagged-${step})` }}
                    >
                      <span className={`font-mono text-[9px] ${i > 4 ? "text-white" : "text-ink"}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">Review Amber Scale (OKLCH hue 75)</span>
                  <span className="font-mono text-faint">--review-50 ... --review-950</span>
                </div>
                <div className="grid grid-cols-11 gap-1 h-10">
                  {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((step, i) => (
                    <div
                      key={step}
                      className="rounded-sm flex flex-col justify-end p-1 transition-transform hover:scale-105"
                      style={{ backgroundColor: `var(--review-${step})` }}
                    >
                      <span className={`font-mono text-[9px] ${i > 4 ? "text-white" : "text-ink"}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </section>

          {/* Section 2: Comprehensive WCAG AA Contrast Audit Table */}
          <section id="contrast-audit" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>02 / Accessibility Compliance</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  WCAG 2.2 AA Contrast Audit Table
                </h2>
              </div>
              <span className="text-body-sm text-semantic-verified font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> All text & UI pairs pass 4.5:1 / 3.0:1
              </span>
            </div>

            <Card elevation="card" className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-muted border-collapse">
                  <thead className="bg-subtle/50 border-b border-hairline font-mono text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3">Token Pair</th>
                      <th className="px-4 py-3">Foreground</th>
                      <th className="px-4 py-3">Background</th>
                      <th className="px-4 py-3 text-right">Light Ratio</th>
                      <th className="px-4 py-3 text-right">Dark Ratio</th>
                      <th className="px-4 py-3 text-center">AA Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {contrastAuditData.map((row) => (
                      <tr key={row.name} className="hover:bg-subtle/40 transition-colors h-[48px]">
                        <td className="px-4 py-2.5 font-sans font-semibold text-ink">{row.name}</td>
                        <td className="px-4 py-2.5 font-mono text-faint">
                          <span className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-middle border border-hairline" style={{ backgroundColor: row.fg }} />
                          {row.fg}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-faint">
                          <span className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-middle border border-hairline" style={{ backgroundColor: row.bg }} />
                          {row.bg}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium text-ink tabular-nums">{row.ratioLight}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium text-ink tabular-nums">{row.ratioDark}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-semantic-verified/10 text-semantic-verified-text dark:text-semantic-verified font-mono text-[11px] font-semibold border border-semantic-verified/20">
                            <Check className="h-3 w-3 stroke-[2.5]" /> {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Section 3: Buttons & Interactive Controls */}
          <section id="buttons" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>03 / Action Primitives</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Button Hierarchy & Width-Preserving Spinners
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                pill-dark (orb) • pill-light • ghost • destructive-soft • icon
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card elevation="card" className="p-6 space-y-6">
                <div>
                  <h3 className="font-sans text-body-md font-semibold text-ink">All Action Variants</h3>
                  <p className="text-body-sm text-muted">Primary and supporting button styles with concentric 9999px pill radii.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="pill-dark" withOrb>
                    Screen Applicant
                  </Button>
                  <Button variant="pill-light">
                    Export Ledger
                  </Button>
                  <Button variant="ghost">
                    Cancel Action
                  </Button>
                  <Button variant="destructive-soft">
                    Revoke Key
                  </Button>
                  <Button variant="icon" aria-label="Settings action">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <Divider label="Size Hierarchy" />

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="pill-dark" size="lg" withOrb>
                    Large (48px)
                  </Button>
                  <Button variant="pill-dark" size="default" withOrb>
                    Default (42px)
                  </Button>
                  <Button variant="pill-dark" size="sm" withOrb>
                    Small (36px)
                  </Button>
                </div>
              </Card>

              <Card elevation="card" className="p-6 space-y-6">
                <div>
                  <h3 className="font-sans text-body-md font-semibold text-ink">Width-Preserving Loading State</h3>
                  <p className="text-body-sm text-muted">Click the toggle below to prove buttons never shift layout width during loading.</p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBtnLoading(!btnLoading)}
                    className="border border-hairline text-brand-sapphire"
                  >
                    Toggle Loading: {btnLoading ? "ACTIVE" : "OFF"}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button variant="pill-dark" isLoading={btnLoading} withOrb>
                    Proving Groth16 ZK
                  </Button>
                  <Button variant="pill-light" isLoading={btnLoading}>
                    Anchoring on Merkle Tree
                  </Button>
                  <Button variant="destructive-soft" isLoading={btnLoading}>
                    Slashing Stake
                  </Button>
                </div>

                <Divider label="Disabled States" />

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="pill-dark" disabled withOrb>
                    Disabled Primary
                  </Button>
                  <Button variant="pill-light" disabled>
                    Disabled Light
                  </Button>
                  <Button variant="ghost" disabled>
                    Disabled Ghost
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 4: Form Controls & Inputs (44px min touch height) */}
          <section id="forms" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>04 / Input Primitives</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Form Controls (44px Min Touch Target)
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                Inline validation • error text + icon • helper slots
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Text Inputs */}
              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Input & Textarea</h3>

                <Input
                  label="Applicant PAN (Default)"
                  placeholder="BKUPG8492Q"
                  helperText="Evaluated strictly in local browser RAM."
                />

                <Input
                  label="Invalid Identifier (Error state)"
                  defaultValue="INVALID123"
                  error="PAN must be 10 alphanumeric characters (e.g. ABCDE1234F)."
                />

                <Textarea
                  label="Fraud Typology Narrative"
                  placeholder="Describe syndicate loan stacking behavior observed across consortium nodes..."
                  rows={3}
                  helperText="Will be hashed into the appeal docket."
                />
              </Card>

              {/* Select & Segmented Control */}
              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Select & Segmented</h3>

                <Select
                  label="Select Consortium Node"
                  defaultValue="meridian"
                  options={[
                    { value: "meridian", label: "Meridian Bank (Mumbai)" },
                    { value: "kestrel", label: "Kestrel Capital (Delhi)" },
                    { value: "aurum", label: "Aurum Commercial (Bengaluru)" },
                  ]}
                  helperText="Primary signing authority for this screening."
                />

                <div className="space-y-1.5 pt-2">
                  <span className="text-body-sm font-medium text-ink block">Segmented Filter Control</span>
                  <SegmentedControl
                    value={segmentedVal}
                    onChange={setSegmentedVal}
                    options={[
                      { value: "meridian", label: "Meridian" },
                      { value: "kestrel", label: "Kestrel" },
                      { value: "all", label: "All Nodes" },
                    ]}
                  />
                  <span className="text-[11px] text-faint block">Active filter: {segmentedVal}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-body-sm font-medium text-ink block">Custom Slider with Value Tooltip</span>
                  <Slider
                    value={sliderVal}
                    onChange={setSliderVal}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                    label="Risk Threshold"
                    helperText="Applicants above threshold require manual review."
                  />
                </div>
              </Card>

              {/* Switch & Checkbox */}
              <Card elevation="card" className="p-6 space-y-6">
                <h3 className="font-sans text-body-md font-semibold text-ink">Switches & Checkboxes</h3>

                <div className="space-y-4">
                  <Switch
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                    label="Zero-Knowledge Client Prover"
                    description="Run Groth16 proof generation inside background Web Worker."
                  />

                  <Switch
                    checked={false}
                    onChange={() => {}}
                    disabled
                    label="Hardware Security Module (HSM)"
                    description="Dedicated signing appliance disabled in testnet mode."
                  />
                </div>

                <Divider />

                <div className="space-y-4">
                  <Checkbox
                    checked={checkboxChecked}
                    onChange={setCheckboxChecked}
                    label="Consent Under Digital Personal Data Protection Act (DPDP)"
                    description="Applicant confirms cryptographic evaluation without cross-bank data leakage."
                  />

                  <Checkbox
                    checked={false}
                    onChange={() => {}}
                    error="You must acknowledge the irreversible slashing terms before staking."
                    label="Irreversible Stake Collateral"
                    description="I acknowledge 0.05 ETH will be deposited in consortium escrow."
                  />
                </div>
              </Card>
            </div>
          </section>

          {/* Section 5: Surfaces, Panels & Restrained Glass */}
          <section id="surfaces" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>05 / Surface Hierarchy</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Concentric Radii (24 → 16 → 12 → 9999) & Restrained Glass
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                Solid content • Glass only on 4 designated surfaces
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Card 3 Elevations */}
              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">3 Card Elevations (Solid)</h3>
                <p className="text-body-sm text-muted">Outer 24px radius with layered hairline borders.</p>

                <div className="space-y-3">
                  <Card elevation="subtle" className="p-4">
                    <span className="font-sans text-xs font-semibold text-ink block">Elevation 1: Subtle</span>
                    <span className="text-body-sm text-muted">For nested items and secondary groups.</span>
                  </Card>

                  <Card elevation="card" className="p-4">
                    <span className="font-sans text-xs font-semibold text-ink block">Elevation 2: Card (Default)</span>
                    <span className="text-body-sm text-muted">Standard container for forms and tables.</span>
                  </Card>

                  <Card elevation="elevated" className="p-4">
                    <span className="font-sans text-xs font-semibold text-ink block">Elevation 3: Elevated</span>
                    <span className="text-body-sm text-muted">For hero moment cards and active focus modals.</span>
                  </Card>
                </div>
              </Card>

              {/* Inner Panel Primitive */}
              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Panel Primitive (16px Radius)</h3>
                <p className="text-body-sm text-muted">Nested inside cards for proportional concentric hierarchy.</p>

                <Panel className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-semibold text-ink">Inner 16px Panel</span>
                    <Badge variant="outline">Concentric</Badge>
                  </div>
                  <p className="text-body-sm text-muted">
                    When nested inside a 24px Card, an inner 16px radius creates natural, organic visual alignment.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                    <span className="text-xs text-faint">Command Palette</span>
                  </div>
                </Panel>

                <Divider label="Dividers with Labels" />

                <Panel className="p-4 bg-subtle/50">
                  <span className="text-body-sm text-muted block">
                    Dividers support optional centered labels in uppercase tracking font.
                  </span>
                </Panel>
              </Card>

              {/* Tabs: Pill and Underline Variants */}
              <Card elevation="card" className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-body-md font-semibold text-ink">Tabs (Pill vs Underline)</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-brand-sapphire"
                    onClick={() => setTabsVariant(tabsVariant === "pill" ? "underline" : "pill")}
                  >
                    Switch: {tabsVariant.toUpperCase()}
                  </Button>
                </div>

                <Tabs defaultValue="tab1" variant={tabsVariant} className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Underwriting</TabsTrigger>
                    <TabsTrigger value="tab2">Ledger Docket</TabsTrigger>
                    <TabsTrigger value="tab3">DAO Appeals</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">
                    <Panel className="p-4 text-body-sm text-muted">
                      Real-time zero-knowledge screening against consortium Poseidon Merkle root.
                    </Panel>
                  </TabsContent>
                  <TabsContent value="tab2">
                    <Panel className="p-4 text-body-sm text-muted">
                      Auditable append-only list of hashed commitment leaves and nullifiers.
                    </Panel>
                  </TabsContent>
                  <TabsContent value="tab3">
                    <Panel className="p-4 text-body-sm text-muted">
                      Democratic consortium consensus for disputed identity records.
                    </Panel>
                  </TabsContent>
                </Tabs>

                <div className="pt-2">
                  {/* Sheet Trigger showcasing Glass Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="pill-light" size="sm" className="w-full">
                        Open Privacy Inspector Sheet (Glass)
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" glass>
                      <SheetHeader>
                        <SheetTitle>Privacy Inspector</SheetTitle>
                        <SheetDescription>
                          Restrained glass sheet surface verified with 40% backdrop blur and hairline border.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6 space-y-4">
                        <Panel className="p-4 space-y-2 bg-surface/90">
                          <span className="text-xs font-semibold text-ink block">Zero-PII Wire Transmission</span>
                          <p className="text-body-sm text-muted">
                            Raw customer identifier remains purely in browser memory during hashing.
                          </p>
                        </Panel>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 6: Data Display, Signals & Feedback */}
          <section id="data" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>06 / Data & Status Signals</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Status Pills (Never Color Alone), HashChips, DataTable & Skeletons
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                Dual indicator icons • 52px sticky rows • Tabular numerals
              </span>
            </div>

            {/* Status Pills with Icons */}
            <Card elevation="card" className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-sans text-body-md font-semibold text-ink">
                    Accessible Status Signals (WCAG 1.4.1)
                  </h3>
                  <p className="text-body-sm text-muted">
                    Every status pill pairs an active dot with an unmistakable semantic icon so color is never the only signal.
                  </p>
                </div>
                <span className="font-mono text-xs text-faint">7 Canonical Variants</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusPill variant="verified" label="Negative Match / Clean" pulse />
                <StatusPill variant="flagged" label="Syndicate Hit Detected" pulse />
                <StatusPill variant="review" label="Requires Senior Review" />
                <StatusPill variant="pending" label="Appeal Countdown Active" />
                <StatusPill variant="consortium" label="DAO Quorum Approved" />
                <StatusPill variant="active" label="Worker Live Proving" />
                <StatusPill variant="neutral" label="Node Standing By" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-hairline">
                <span className="text-xs text-muted mr-1">Compact Sizing:</span>
                <StatusPill variant="verified" size="sm" label="Clean" />
                <StatusPill variant="flagged" size="sm" label="Hit" />
                <StatusPill variant="review" size="sm" label="Review" />
                <StatusPill variant="pending" size="sm" label="Pending" />
                <StatusPill variant="consortium" size="sm" label="Consortium" />
              </div>
            </Card>

            {/* Stepper & Timeline Primitives */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Multi-Step Stepper</h3>
                <p className="text-body-sm text-muted">Horizontal responsive workflow indicator with active, complete, and upcoming states.</p>

                <Stepper
                  currentStepIndex={1}
                  steps={[
                    { id: 1, title: "Normalize ID", description: "In-memory RAM" },
                    { id: 2, title: "Generate ZK Proof", description: "Groth16 BN254" },
                    { id: 3, title: "Screen Registry", description: "0-PII query" },
                    { id: 4, title: "Decision", description: "Instant clear" },
                  ]}
                />
              </Card>

              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Audit Timeline Primitive</h3>
                <p className="text-body-sm text-muted">Continuous vertical spine for ledger transaction history.</p>

                <Timeline
                  items={[
                    {
                      id: "1",
                      title: "Fraud Leaf Anchored",
                      timestamp: "14:28:10 IST",
                      badge: <StatusPill variant="flagged" size="sm" label="Committed" />,
                      description: "0.05 ETH collateral deposited by Meridian Bank.",
                      isLatest: true,
                    },
                    {
                      id: "2",
                      title: "Merkle Root Updated",
                      timestamp: "14:28:14 IST",
                      badge: <StatusPill variant="verified" size="sm" label="Root Sync #48" />,
                      description: "Smart contract emitted RootUpdated event on testnet.",
                    },
                  ]}
                />
              </Card>
            </div>

            {/* DataTable Showcase */}
            <div className="space-y-4 mb-6">
              <DataTable
                title="Consortium Verification Ledger"
                columns={columns}
                data={sampleData}
                keyExtractor={(row) => row.id}
                defaultDensity={tableDensity}
                showDensityToggle={true}
              />
            </div>

            {/* MetricCard, Term & EmptyState */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
              <MetricCard
                label="Flagged Identity Leaves"
                value="1,482"
                numericValue={1482}
                countUp
                trend={{ value: "+14% vs last cycle", positive: false }}
                sublabel="Consortium registry"
                icon={<Shield className="h-4 w-4" />}
                sparklineData={[12, 18, 15, 24, 28, 35, 42]}
              />

              <Card elevation="card" className="p-6 space-y-4">
                <h3 className="font-sans text-body-md font-semibold text-ink">Glossary &lt;Term&gt; Component</h3>
                <p className="text-body-sm text-muted">
                  Institutional tooltips with plain explanations for zero-knowledge terminology:
                </p>

                <div className="p-4 rounded-panel bg-subtle/50 space-y-2 text-body-sm">
                  <p>
                    Every applicant is hashed into a <Term id="Commitment">commitment leaf</Term> and checked against the <Term id="Merkle root">Merkle root</Term>.
                  </p>
                  <p>
                    A <Term id="Nullifier">nullifier</Term> prevents double-spend while measuring <Term id="Ring velocity">ring velocity</Term>.
                  </p>
                </div>
              </Card>

              <EmptyState
                title="No Pending Appeals"
                description="All consortium fraud disputes have concluded voting quorum."
                actionText="View Past Archive"
                onAction={() => alert("Archive requested")}
              />
            </div>

            {/* Skeleton Set Showcase */}
            <Card elevation="card" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-body-md font-semibold text-ink">Skeleton Set</h3>
                  <p className="text-body-sm text-muted">Tailored loading skeletons prevent layout shift while async keys download.</p>
                </div>
                <Badge variant="outline">Pulse Shimmer</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                <SkeletonMetric />
                <SkeletonCard />
                <div className="p-4 rounded-card border border-hairline bg-surface space-y-3">
                  <span className="text-xs font-semibold text-ink block">Text Lines Skeleton</span>
                  <SkeletonText lines={4} />
                </div>
              </div>
            </Card>
          </section>

          {/* Section 7: Institutional Design "Do's & Don'ts" Panel */}
          <section id="dodont" className="mt-16 scroll-mt-20">
            <div className="mb-6 flex flex-col items-start justify-between gap-1 border-b border-hairline pb-4 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>07 / Architecture Governance</Eyebrow>
                <h2 className="font-serif text-heading-lg text-ink">
                  Institutional Design Rules: Do&apos;s &amp; Don&apos;ts
                </h2>
              </div>
              <span className="font-mono text-xs text-faint">
                Kavach Premium Guidelines
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* DO Panel */}
              <Card elevation="card" className="p-6 border-l-4 border-l-semantic-verified space-y-4">
                <div className="flex items-center gap-2 text-semantic-verified-text dark:text-semantic-verified font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>DO (Strict Guidelines)</span>
                </div>

                <ul className="space-y-3 text-body-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-verified font-bold mt-0.5">✓</span>
                    <span><strong>Concentric Radii:</strong> Use 24px outer card, 16px inner panel, 12px input/control, and 9999px pills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-verified font-bold mt-0.5">✓</span>
                    <span><strong>Restrained Glass:</strong> Apply <code className="font-mono text-xs text-ink bg-subtle px-1">.glass</code> ONLY to floating top bar, Privacy Inspector sheet, toasts/popovers, and demo control pill.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-verified font-bold mt-0.5">✓</span>
                    <span><strong>Meaningful Color:</strong> Green = verified/clear, Red = flagged/decline, Amber = review, Primary Blue = focus/action, Gold = consortium DAO authority.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-verified font-bold mt-0.5">✓</span>
                    <span><strong>Dual Indicators:</strong> Always pair status colors with unmistakable text and icons so color is never the only signal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-verified font-bold mt-0.5">✓</span>
                    <span><strong>Tabular Numerals:</strong> Use <code className="font-mono text-xs text-ink bg-subtle px-1">tabular-nums</code> for all metric values, timestamps, and amounts to prevent jitter.</span>
                  </li>
                </ul>
              </Card>

              {/* DON'T Panel */}
              <Card elevation="card" className="p-6 border-l-4 border-l-semantic-flagged space-y-4">
                <div className="flex items-center gap-2 text-semantic-flagged font-semibold">
                  <AlertCircle className="h-5 w-5" />
                  <span>DON&apos;T (Strict Anti-Patterns)</span>
                </div>

                <ul className="space-y-3 text-body-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-flagged font-bold mt-0.5">✕</span>
                    <span><strong>Never Glass-on-Glass:</strong> Do not put glass cards inside glass sheets or behind glass topbars. Keep all content cards solid.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-flagged font-bold mt-0.5">✕</span>
                    <span><strong>Never Fake Data or Delays:</strong> Seeds must be labeled &quot;Demo data&quot;, mock steps &quot;Simulation&quot;. Do not synthesize fake setTimeout delays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-flagged font-bold mt-0.5">✕</span>
                    <span><strong>No Jargon Without Terms:</strong> Do not introduce cryptographic terms without wrapping them in the <code className="font-mono text-xs text-ink bg-subtle px-1">&lt;Term&gt;</code> gloss component.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-flagged font-bold mt-0.5">✕</span>
                    <span><strong>No Touch Targets Under 44px:</strong> Form controls and interactive triggers must maintain at least 44px minimum touch height.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-semantic-flagged font-bold mt-0.5">✕</span>
                    <span><strong>No Monospace for UI Text:</strong> Monospace is strictly reserved for hashes, nullifiers, addresses, and code snippets.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Dialog Modal Inspector */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kavach Token Architecture</DialogTitle>
                <DialogDescription>
                  Zero-knowledge fraud shield tokens mapped strictly to CSS custom properties.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-body-sm">
                <div className="flex justify-between border-b border-hairline py-1.5">
                  <span className="text-muted">Primary Canvas</span>
                  <span className="font-mono text-ink">#F7F9FD (Light) / #080C1A (Dark)</span>
                </div>
                <div className="flex justify-between border-b border-hairline py-1.5">
                  <span className="text-muted">Elevated Surface</span>
                  <span className="font-mono text-ink">#FFFFFF (Light) / #0F1530 (Dark)</span>
                </div>
                <div className="flex justify-between border-b border-hairline py-1.5">
                  <span className="text-muted">Concentric Radii Hierarchy</span>
                  <span className="font-mono text-ink">24px card → 16px panel → 12px input → 9999px pill</span>
                </div>
                <div className="flex justify-between border-b border-hairline py-1.5">
                  <span className="text-muted">Motion Curve</span>
                  <span className="font-mono text-ink">[0.22, 1, 0.36, 1]</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">WCAG AA Standard</span>
                  <span className="font-mono text-semantic-verified font-semibold">100% Verified Pass</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="pill-dark" onClick={() => setDialogOpen(false)} withOrb={false}>
                  Acknowledge Architecture
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </TooltipProvider>
  );
}
