"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBankSession } from "../context/BankSessionContext";
import { getAllBanks, getDemoBanks } from "../lib/banks";
import seedsData from "../generated/seeds.json";
import {
  Search,
  UserCheck,
  ShieldAlert,
  Layers,
  Scale,
  ShieldCheck,
  Presentation,
  Building2,
  ArrowRight,
  Command,
  Hash,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Navigation" | "Quick Action" | "Member Banks" | "Demo Data";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { bankId, setBankId } = useBankSession();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset search and selection when modal opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  const banks = getAllBanks();

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: "nav-home",
        category: "Navigation",
        title: "Home — Role-Aware Overview",
        subtitle: `Active underwriter dashboard for ${bankId.toUpperCase()}`,
        icon: Building2,
        action: () => {
          router.push(`/bank/${bankId}`);
          setOpen(false);
        },
        keywords: ["home", "dashboard", "overview"],
      },
      {
        id: "nav-screen",
        category: "Quick Action",
        title: "Screen Applicant",
        subtitle: "Client-side Groth16 zero-knowledge fraud check (Shortcut: S)",
        icon: UserCheck,
        action: () => {
          router.push(`/bank/${bankId}/screen`);
          setOpen(false);
        },
        keywords: ["screen", "onboard", "verify", "applicant", "borrower"],
      },
      {
        id: "nav-flag",
        category: "Quick Action",
        title: "Flag Fraudulent Identity",
        subtitle: "Poseidon BN254 commitment synthesis & 0.05 ETH collateral (Shortcut: F)",
        icon: ShieldAlert,
        action: () => {
          router.push(`/bank/${bankId}/flag`);
          setOpen(false);
        },
        keywords: ["flag", "fraudster", "blacklist", "commitment"],
      },
      {
        id: "nav-network",
        category: "Navigation",
        title: "Network Activity & Ring Velocity",
        subtitle: "Consortium ledger, 30-root rolling buffer, and FedAvg simulation",
        icon: Layers,
        action: () => {
          router.push("/network");
          setOpen(false);
        },
        keywords: ["network", "ledger", "tree", "velocity", "federated"],
      },
      {
        id: "nav-appeals",
        category: "Quick Action",
        title: "Appeals & Dispute Resolution",
        subtitle: "Adjudication chamber, supermajority voting & stake slashing (Shortcut: G then A)",
        icon: Scale,
        action: () => {
          router.push("/appeals");
          setOpen(false);
        },
        keywords: ["dao", "appeal", "dispute", "slashing", "vote"],
      },
      {
        id: "nav-privacy",
        category: "Navigation",
        title: "Trust & Privacy Architecture",
        subtitle: "DPDP Act (2023) Section 4 compliance & zero-knowledge guarantee",
        icon: ShieldCheck,
        action: () => {
          router.push("/privacy");
          setOpen(false);
        },
        keywords: ["privacy", "dpdp", "trust", "zero-knowledge", "zk"],
      },
      {
        id: "nav-demo",
        category: "Navigation",
        title: "Presenter Pitch Mode",
        subtitle: "5-step 3-minute guided consortium protocol walkthrough",
        icon: Presentation,
        action: () => {
          router.push("/demo");
          setOpen(false);
        },
        keywords: ["demo", "pitch", "presenter", "investor"],
      },
      {
        id: "nav-brand",
        category: "Navigation",
        title: "Brand System & Visual Language",
        subtitle: "Logo architecture, duotone illustrations, 60fps proof network & chart kit",
        icon: Sparkles,
        action: () => {
          router.push("/brand");
          setOpen(false);
        },
        keywords: ["brand", "logo", "illustrations", "design", "charts", "skins"],
      },

      // Quick Actions
      {
        id: "action-tour",
        category: "Quick Action",
        title: "Restart Guided First-Run Tour",
        subtitle: "4-step interactive coach-mark walkthrough",
        icon: Sparkles,
        action: () => {
          setOpen(false);
          import("./GuidedTour").then((m) => m.launchGuidedTour());
        },
        keywords: ["tour", "guide", "help", "walkthrough", "onboarding"],
      },
      {
        id: "action-shortcuts",
        category: "Quick Action",
        title: "Keyboard Shortcuts Sheet (?)",
        subtitle: "View institutional hotkeys & chord bindings",
        icon: Command,
        action: () => {
          setOpen(false);
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
        },
        keywords: ["shortcuts", "hotkeys", "keyboard", "help"],
      },

      // Member Banks
      ...banks.map((b) => ({
        id: `bank-${b.id}`,
        category: "Member Banks" as const,
        title: `Switch to ${b.name}`,
        subtitle: `${b.branchCity} • Authorized underwriter node`,
        icon: Building2,
        action: () => {
          setBankId(b.id);
          router.push(`/bank/${b.id}`);
          setOpen(false);
        },
        keywords: [b.name, b.code, b.branchCity, "bank", "switch"],
      })),

      // Demo Data Profiles
      ...seedsData.seedRecords.slice(0, 4).map((s: any) => ({
        id: `seed-${s.id}`,
        category: "Demo Data" as const,
        title: `Lookup: ${s.id} (${s.type})`,
        subtitle: `${s.categoryName || s.category} • ${s.reason}`,
        icon: Hash,
        action: () => {
          router.push(`/bank/${bankId}/screen?id=${s.id}`);
          setOpen(false);
        },
        keywords: [s.id, s.type, String(s.categoryName || s.category), s.reason].filter(Boolean),
      })),
    ];

    return list;
  }, [bankId, banks, router, setBankId]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    const raw = search.trim();
    if (!raw) return commands;

    const q = raw.toLowerCase();
    const matched = commands.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.keywords?.some((k) => (typeof k === "string" ? k.toLowerCase().includes(q) : String(k).toLowerCase().includes(q)))
    );

    // If typing a cryptographic hash or transaction ID (0x...)
    if (q.startsWith("0x")) {
      const hashActions: CommandItem[] = [
        {
          id: `hash-search-${q}`,
          category: "Quick Action",
          title: `Search Registry for Leaf/Nullifier: ${raw.slice(0, 16)}...`,
          subtitle: "Inspect on-chain Merkle tree & transaction history",
          icon: Search,
          action: () => {
            router.push(`/network?q=${raw}`);
            setOpen(false);
          },
          keywords: [raw, "hash", "leaf", "nullifier", "tx"],
        },
        {
          id: `hash-screen-${q}`,
          category: "Quick Action",
          title: `Test Proof with Hash: ${raw.slice(0, 16)}...`,
          subtitle: "Open client-side Groth16 screening flow",
          icon: UserCheck,
          action: () => {
            router.push(`/bank/${bankId}/screen?hash=${raw}`);
            setOpen(false);
          },
          keywords: [raw, "screen", "verify"],
        },
      ];
      return [...hashActions, ...matched];
    }

    return matched;
  }, [commands, search, router, bankId]);

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    },
    [filteredCommands, selectedIndex]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-card glass overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline bg-surface">
          <Search className="h-5 w-5 text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, bank, or ID number..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-muted bg-subtle border border-hairline">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-hairline/50">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">
              No matching commands or identifiers found.
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-card cursor-pointer transition-colors text-xs",
                    isSelected
                      ? "bg-subtle text-ink font-medium"
                      : "text-muted hover:bg-subtle/50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? "bg-brand-sapphire text-white border-brand-sapphire"
                          : "bg-surface text-muted border-hairline"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-ink truncate">
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-muted truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-subtle text-faint">
                      {cmd.category}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-faint" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2.5 bg-subtle/40 border-t border-hairline flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd> to navigate</span>
            <span><kbd className="font-mono font-semibold">↵</kbd> to select</span>
          </div>
          <span className="font-mono text-[10px]">Kavach Consortium OS v2.0</span>
        </div>
      </div>
    </div>
  );
}

