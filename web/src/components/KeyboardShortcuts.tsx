"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Modal } from "./Modal";
import { Keyboard, Command, ArrowRight } from "lucide-react";

export function KeyboardShortcuts() {
  const router = useRouter();
  const params = useParams();
  const bankId = typeof params.id === "string" ? params.id : "meridian";

  const [isOpen, setIsOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if active element is input, textarea, or contenteditable
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // '?' opens shortcuts sheet
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // 'G' prefix for two-key chords
      if (e.key.toLowerCase() === "g" && !gPressed) {
        setGPressed(true);
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => setGPressed(false), 1500);
        return;
      }

      if (gPressed) {
        setGPressed(false);
        if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          router.push(`/bank/${bankId}`);
          return;
        }
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          router.push(`/bank/${bankId}/screen`);
          return;
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          router.push(`/bank/${bankId}/flag`);
          return;
        }
        if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          router.push(`/network`);
          return;
        }
        if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          router.push(`/appeals`);
          return;
        }
      }

      // Single key shortcuts when not in G mode
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          router.push(`/bank/${bankId}/screen`);
          return;
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          router.push(`/bank/${bankId}/flag`);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [gPressed, router, bankId]);

  const shortcuts = [
    { keys: ["S"], label: "Screen applicant (ZK Prover)" },
    { keys: ["F"], label: "Flag confirmed fraudster" },
    { keys: ["G", "H"], label: "Go to Bank Overview (Home)" },
    { keys: ["G", "N"], label: "Go to Consortium Network Ledger" },
    { keys: ["G", "A"], label: "Go to Governance & Appeals" },
    { keys: ["⌘", "K"], label: "Open command palette actions" },
    { keys: ["P"], label: "Inspect client-side privacy boundaries" },
    { keys: ["?"], label: "Show keyboard shortcut manual" },
    { keys: ["Esc"], label: "Close active dialog or drawer" },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Shortcuts"
        subtitle="Institutional Hotkeys & Rapid Navigation"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-muted">
            Navigate the consortium console instantly without leaving your keyboard.
          </p>

          <div className="divide-y divide-hairline rounded-xl border border-hairline bg-surface/50 overflow-hidden">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="p-3 flex items-center justify-between text-xs hover:bg-surface transition-colors"
              >
                <span className="text-ink font-medium">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  {s.keys.map((k, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="px-2 py-1 rounded bg-muted/20 border border-hairline font-mono text-[11px] text-ink font-semibold shadow-xs">
                        {k}
                      </kbd>
                      {kIdx < s.keys.length - 1 && (
                        <span className="text-[10px] text-muted">then</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-muted">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted/20 font-mono text-ink">?</kbd> anywhere to toggle this guide</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brand-sapphire hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

