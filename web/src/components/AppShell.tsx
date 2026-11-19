"use client";

import React, { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Layers,
  Scale,
  Activity,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  Bell,
  Terminal,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  ExternalLink,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Eye,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { SystemStatus } from "./SystemStatus";
import { getDemoBanks, BankConfig } from "../lib/banks";
import { useBankSession } from "../context/BankSessionContext";
import { useRegistryEvents } from "../hooks/useRegistryEvents";
import { getProvider } from "../lib/web3";
import {
  Button,
  StatusPill,
  HashChip,
  BankMonogram,
  MeshBackground,
  Card,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui";
import { ThemeToggle } from "./ui/ThemeToggle";
import { KavachLogo, KavachLogoMark } from "./KavachLogo";
import { PrivacyInspector } from "./PrivacyInspector";
import { NotificationCenter } from "./NotificationCenter";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { GuidedTour } from "./GuidedTour";
import { useToast } from "./Toast";
import { cn } from "@/lib/utils";
import { getNetworkMode } from "@/lib/dataProvider";

const BANK_INITIALS_MAP: Record<string, string> = {
  meridian: "MB",
  aurum: "AU",
  halcyon: "HA",
  northgate: "NG",
  vantage: "VA",
  kestrel: "KC",
  sbi: "AU",
  hdfc: "HA",
  icici: "NG",
  axis: "VA",
  pnb: "KC",
};

interface AppShellProps {
  children: ReactNode;
  activeBankId?: string;
  pageTitle?: string;
}

export function AppShell({ children, activeBankId, pageTitle }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { bankId, setBankId, bank, address, devLabel, balance } = useBankSession();
  const { showToast } = useToast();
  const networkMode = getNetworkMode();

  const [collapsed, setCollapsed] = useState(false);
  const [bankPopoverOpen, setBankPopoverOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [blockHeight, setBlockHeight] = useState<number>(31);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; time: string; link?: string }>
  >([
    {
      id: "notif-1",
      title: "Consortium Merkle root updated on-chain (Epoch 42)",
      time: "2m ago",
      link: "/network",
    },
    {
      id: "notif-2",
      title: "Appeal #1 submitted by Halcyon Bank requires quorum vote",
      time: "15m ago",
      link: "/dao",
    },
  ]);

  // Sync activeBankId prop if provided
  useEffect(() => {
    if (activeBankId && activeBankId !== bankId) {
      setBankId(activeBankId);
    }
  }, [activeBankId, bankId, setBankId]);

  // Real on-chain block listener
  useEffect(() => {
    let mounted = true;
    const fetchBlock = async () => {
      try {
        if (getNetworkMode() === "replay") {
          if (mounted) setBlockHeight(31);
          return;
        }
        const p = getProvider();
        const b = await p.getBlockNumber();
        if (mounted && b) setBlockHeight(b);
      } catch {}
    };
    fetchBlock();
    const interval = setInterval(fetchBlock, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Real-time registry events & cross-bank alert hook
  const { crossBankAlert, dismissAlert } = useRegistryEvents(address);
  const lastAlertedIdRef = React.useRef<string | null>(null);
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (typeof window === "undefined") return set;
    try {
      const raw = localStorage.getItem("kavach_dismissed_alerts");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => {
            if (typeof id === "string" && id.trim()) {
              set.add(id.toLowerCase().trim());
            }
          });
        }
      }
    } catch {}
    return set;
  });

  const handleDismissAlert = useCallback(
    (alertId?: string, nullifier?: string) => {
      const toAdd: string[] = [];
      if (alertId) {
        const cleanId = alertId.toLowerCase().trim();
        toAdd.push(cleanId);
        if (!cleanId.startsWith("alert-")) toAdd.push(`alert-${cleanId}`);
      }
      if (nullifier) {
        const cleanNullifier = nullifier.toLowerCase().trim();
        toAdd.push(cleanNullifier);
        toAdd.push(`alert-${cleanNullifier}`);
      }

      setLocalDismissed((prev) => {
        const next = new Set(prev);
        toAdd.forEach((id) => next.add(id));
        return next;
      });

      // Synchronously persist to localStorage
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("kavach_dismissed_alerts");
          const existing = raw ? JSON.parse(raw) : [];
          const combined = new Set([
            ...(Array.isArray(existing) ? existing.map((x: string) => String(x).toLowerCase().trim()) : []),
            ...toAdd,
          ]);
          localStorage.setItem("kavach_dismissed_alerts", JSON.stringify(Array.from(combined)));
        }
      } catch {}

      // Call hook dismissAlert with BOTH alertId and nullifier
      dismissAlert(alertId, nullifier);
    },
    [dismissAlert]
  );

  // When a cross-bank alert arrives, record in notifications list
  useEffect(() => {
    if (crossBankAlert && crossBankAlert.id !== lastAlertedIdRef.current) {
      lastAlertedIdRef.current = crossBankAlert.id;
      setNotifications((prev) => [
        {
          id: crossBankAlert.id,
          title: `Identity flagged was screened at ${crossBankAlert.message.split("presented at ")[1] || "another consortium bank"}`,
          time: "Just now",
          link: `/bank/${bankId}`,
        },
        ...prev,
      ]);
    }
  }, [crossBankAlert, bankId]);

  const demoBanks = getDemoBanks();

  const handleBankChange = (newBankId: string) => {
    setBankId(newBankId);
    setBankPopoverOpen(false);

    if (pathname.includes("/bank/")) {
      const isScanner = pathname.includes("/screen") || pathname.includes("/onboard");
      const isFlag = pathname.includes("/flag");
      router.push(`/bank/${newBankId}${isScanner ? "/screen" : isFlag ? "/flag" : ""}`);
    }

    const b = demoBanks.find((x) => x.id === newBankId);
    showToast({
      title: `Switched Context: ${b?.name || newBankId}`,
      message: `Active underwriter context updated to ${b?.code}. Dev signer loaded.`,
      type: "info",
    });
  };

  const primaryNav = [
    {
      id: "nav-home",
      href: `/bank/${bankId}`,
      label: "Home",
      icon: Building2,
      exact: true,
    },
    {
      id: "nav-screen",
      href: `/bank/${bankId}/screen`,
      label: "Screen applicant",
      icon: UserCheck,
      exact: false,
    },
    {
      id: "nav-flag",
      href: `/bank/${bankId}/flag`,
      label: "Flag identity",
      icon: ShieldAlert,
      exact: false,
    },
    {
      id: "nav-network",
      href: "/network",
      label: "Network activity",
      icon: Layers,
      exact: false,
    },
    {
      id: "nav-appeals",
      href: "/appeals",
      label: "Appeals",
      icon: Scale,
      exact: false,
    },
    {
      id: "nav-privacy",
      href: "/trust",
      label: "Trust & privacy",
      icon: ShieldCheck,
      exact: true,
    },
  ];

  const renderNavLinks = (isDrawer = false) => (
    <div className="space-y-4">
      {(!collapsed || isDrawer) && (
        <div className="px-3 pb-1 text-[11px] font-medium text-muted select-none">
          Consortium protocols
        </div>
      )}
      <ul className="space-y-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== `/bank/${bankId}`;

          return (
            <li key={item.label}>
              <Link
                id={item.id}
                href={item.href}
                onClick={() => isDrawer && setMobileDrawerOpen(false)}
                title={collapsed && !isDrawer ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-pill px-3.5 py-2 text-sm font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]",
                  isActive
                    ? "bg-subtle text-ink font-semibold border border-hairline shadow-subtle"
                    : "text-muted hover:text-ink hover:bg-subtle/70",
                  collapsed && !isDrawer && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted"
                  )}
                />
                {(!collapsed || isDrawer) && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-canvas text-ink flex font-sans selection:bg-primary/15 selection:text-ink"
      data-bank={bankId}
    >
      {/* Background Mesh Lighting (40% subtle in app) */}
      <MeshBackground intensity="app" />

      {/* ======================================================== */}
      {/* DESKTOP SLIM LEFT RAIL (264px -> 72px)                    */}
      {/* ======================================================== */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 bg-surface border-r border-hairline min-h-screen sticky top-0 h-screen z-20 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[264px]"
        )}
        aria-label="Sidebar navigation"
      >
        {/* Brand Banner */}
        <div className="h-16 border-b border-hairline px-4 flex items-center justify-between">
          <Link
            href="/"
            className={cn("flex items-center gap-2.5 group overflow-hidden", collapsed && "justify-center w-full")}
          >
            {collapsed ? (
              <KavachLogoMark size="sm" />
            ) : (
              <KavachLogo variant="full" size="sm" />
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-pill text-muted hover:text-ink hover:bg-subtle transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bank Switcher Popover */}
        <div className="p-3 border-b border-hairline">
          <Popover open={bankPopoverOpen} onOpenChange={setBankPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-card border border-hairline bg-surface hover:bg-subtle/80 transition-all text-left shadow-subtle select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]",
                  collapsed && "justify-center p-1.5"
                )}
                title={collapsed ? bank.name : undefined}
                aria-label={collapsed ? bank.name : undefined}
              >
                <BankMonogram bankId={bank.id} size={collapsed ? "sm" : "default"} />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-ink truncate flex items-center justify-between">
                      <span className="truncate">{bank.name}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0 ml-1" />
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {bank.branchCity}
                    </div>
                  </div>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-72 p-2">
              <div className="px-3 py-1.5 border-b border-hairline text-xs font-semibold text-muted tracking-wider">
                Select Member Bank
              </div>
              <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                {demoBanks.map((b) => {
                  const isSelected = b.id === bank.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBankChange(b.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-card flex items-center justify-between gap-3 text-xs transition-colors min-h-[44px]",
                        isSelected
                          ? "bg-subtle text-ink font-semibold border border-hairline"
                          : "text-muted hover:bg-subtle/70 hover:text-ink"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <BankMonogram bankId={b.id} size="sm" />
                        <div className="truncate">
                          <div className="font-medium text-ink truncate">{b.name}</div>
                          <div className="text-[11px] text-faint truncate">
                            {b.branchCity}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-semantic-verified shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {renderNavLinks(false)}
        </nav>

        {/* Expand toggle when collapsed */}
        {collapsed && (
          <div className="p-3 border-t border-hairline flex justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-pill text-muted hover:text-ink hover:bg-subtle transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Clean Institutional Footer: Network Healthy & Trust Link */}
        {!collapsed && (
          <div className="p-3 border-t border-hairline mt-auto">
            <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-card bg-subtle/40 border border-hairline">
              <span className="flex items-center gap-2 text-ink font-medium">
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      networkMode === "replay" ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      networkMode === "replay" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </span>
                <span className="text-[11px]">
                  {networkMode === "replay" ? "Snapshot replay" : "Network healthy"}
                </span>
              </span>
              <Link
                href="/trust"
                className="text-muted hover:text-ink text-[11px] hover:underline font-medium"
              >
                Trust & privacy
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTAINER (Floating Glass Top Bar + Content)         */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Global Institutional System Health & Diagnostics */}
        <SystemStatus showSimulator={false} />

        {/* Floating Glass Top Bar (12px from edges, radius 16) */}
        <header className="m-3 mx-3 mt-3 mb-2 rounded-[16px] glass h-14 px-4 sticky top-3 z-30 flex items-center justify-between gap-3 shadow-card">
          {/* Breadcrumb Left */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sheet Trigger (< 1024px) */}
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-pill text-muted hover:text-ink hover:bg-subtle transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="glass w-72 p-4">
                <SheetHeader className="mb-4 pb-3 border-b border-hairline">
                  <SheetTitle className="flex items-center gap-2">
                    <KavachLogo variant="full" size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  <div className="p-3 rounded-card bg-subtle/50 border border-hairline">
                    <div className="flex items-center gap-2 mb-1">
                      <BankMonogram bankId={bank.id} size="sm" />
                      <span className="font-semibold text-xs text-ink">{bank.name}</span>
                    </div>
                    <span className="text-[11px] text-muted">{bank.branchCity}</span>
                  </div>
                  {renderNavLinks(true)}
                  <div className="pt-4 mt-4 border-t border-hairline flex items-center justify-between px-1">
                    <span className="text-xs text-muted font-medium">Appearance</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-1.5 text-xs text-muted truncate">
              <span className="hidden sm:inline">Consortium</span>
              <span className="hidden sm:inline text-faint">/</span>
              <span className="text-ink font-medium truncate">{bank.name}</span>
              <span className="text-faint">/</span>
              <span className="text-muted truncate">{pageTitle || "Dashboard"}</span>
            </div>
          </div>

          {/* Right Controls: Replay Pill, Search, Small Status Dot, Bell, Avatar Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Demo Snapshot Calm Pill (Replay Mode) */}
            {networkMode === "replay" && (
              <a
                href="https://github.com/Tarun260-code/kavach-network#quickstart"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="replay-pill"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 transition-colors shadow-xs"
                title="This hosted demo replays recorded data. Run locally for live transactions."
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Demo snapshot (read-only)</span>
              </a>
            )}

            {/* Global Search / Command Palette Trigger (No Actions label) */}
            <button
              type="button"
              onClick={() => {
                const evt = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                window.dispatchEvent(evt);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-pill border border-hairline bg-surface/60 hover:bg-surface text-xs text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]"
              title="Search / Command Palette (⌘K)"
              aria-label="Search ⌘K"
            >
              <Search className="h-3.5 w-3.5 text-muted" />
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-subtle border border-hairline text-ink/80 font-semibold hidden sm:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* Small Status Dot with Tooltip */}
            <div
              className="flex items-center justify-center p-2 rounded-full hover:bg-subtle/50 transition-colors cursor-help min-h-[36px] min-w-[36px]"
              title={
                networkMode === "replay"
                  ? "Demo snapshot (read-only) • Replaying Block #31"
                  : `Network healthy • Block #${blockHeight} synced`
              }
              role="status"
              aria-label={networkMode === "replay" ? "Demo snapshot (read-only)" : "Network healthy"}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    networkMode === "replay" ? "bg-amber-400" : "bg-emerald-400"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2.5 w-2.5",
                    networkMode === "replay" ? "bg-amber-500" : "bg-emerald-500"
                  )}
                />
              </span>
            </div>

            {/* Notifications Bell */}
            <NotificationCenter />

            {/* Unified Avatar Menu */}
            <Popover open={avatarMenuOpen} onOpenChange={setAvatarMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center p-0.5"
                  aria-label={`${BANK_INITIALS_MAP[bank.id.toLowerCase()] || "MB"} - ${bank.name} preferences`}
                >
                  <BankMonogram bankId={bank.id} size="default" />
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-4 space-y-4 glass">
                {/* Bank Identity Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-hairline">
                  <BankMonogram bankId={bank.id} size="default" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-ink truncate">{bank.name}</h4>
                    <p className="text-[11px] text-muted truncate">{bank.tagline}</p>
                  </div>
                </div>

                {/* Appearance: Segmented Pill */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted font-medium">Appearance</span>
                  <ThemeToggle />
                </div>

                {/* Privacy Inspector Shortcut */}
                <div className="pt-2 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      const evt = new KeyboardEvent("keydown", { key: "p", bubbles: true });
                      window.dispatchEvent(evt);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-card bg-subtle/50 hover:bg-subtle text-xs text-ink transition-colors min-h-[40px]"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>Privacy Inspector</span>
                    </div>
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-hairline text-faint">
                      P
                    </kbd>
                  </button>
                </div>

                {/* Developer Node Telemetry */}
                <div className="pt-2 border-t border-hairline space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <Terminal className="h-3 w-3 text-primary" />
                      <span>Developer Context</span>
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-pill bg-subtle text-muted">
                      Hardhat 31337
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted">Signer</span>
                    <span className="font-mono text-ink font-medium">{devLabel}</span>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-muted block mb-1">Node HSM Key</span>
                    <HashChip hash={address} label="HSM" />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted">Balance</span>
                    <span className="font-mono text-semantic-verified font-medium">{balance}</span>
                  </div>
                </div>

                {/* System Fault Simulator Trigger */}
                <div className="pt-2 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("kavach:open-fault-simulator"));
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-card bg-subtle/50 hover:bg-subtle text-xs text-ink transition-colors min-h-[40px]"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="h-3.5 w-3.5 text-muted" />
                      <span>Test Failure Modes</span>
                    </div>
                    <span className="text-[10px] font-mono text-faint">Faults</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Real-time Dismissible Cross-Bank Toast Card (Stacked Top-Right with 16px gap, Fictional Banks) */}
        {crossBankAlert &&
          !localDismissed.has(crossBankAlert.id.toLowerCase()) &&
          !localDismissed.has(crossBankAlert.id.toLowerCase().replace(/^alert-/, "")) &&
          !localDismissed.has(crossBankAlert.nullifier.toLowerCase()) &&
          !localDismissed.has(crossBankAlert.nullifier.toLowerCase().replace(/^0x/, "")) &&
          !localDismissed.has(`alert-${crossBankAlert.nullifier.toLowerCase()}`) &&
          !localDismissed.has(`alert-${crossBankAlert.id.toLowerCase()}`) && (
          <aside
            role="region"
            aria-label="Cross-Bank Alert"
            className="fixed top-[80px] right-4 sm:right-6 z-[60] max-w-sm w-full animate-in slide-in-from-top-4 duration-300"
          >
            <Card className="p-4 glass relative overflow-hidden border-semantic-flagged/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-semantic-flagged animate-ping" />
                  <h4 className="font-sans text-xs font-semibold text-semantic-flagged uppercase tracking-wider">
                    Cross-Bank Alert
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(crossBankAlert.id, crossBankAlert.nullifier)}
                  className="text-muted hover:text-ink p-1 rounded-full transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-ink font-medium mt-2 leading-relaxed">
                {crossBankAlert.message}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-hairline">
                <span className="font-mono text-[10px] text-faint">
                  Nullifier: {crossBankAlert.nullifier.slice(0, 10)}...
                </span>
                <Link
                  href={`/bank/${bankId}`}
                  onClick={() => handleDismissAlert(crossBankAlert.id, crossBankAlert.nullifier)}
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 min-h-[32px]"
                >
                  <span>View hit</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          </aside>
        )}

        {/* Main Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Cmd/Ctrl + K) */}
      <CommandPalette />

      {/* Interactive Walkthrough Tour Overlay */}
      <GuidedTour />

      {/* Keyboard Shortcuts Sheet Modal (?) */}
      <KeyboardShortcuts />
    </div>
  );
}

export default AppShell;
