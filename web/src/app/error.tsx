"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button, Card, MeshBackground } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kavach Web Application Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 selection:bg-brand-sapphire/20 font-sans relative">
      <MeshBackground intensity="subtle" />

      <Card className="w-full max-w-md p-8 bg-surface border-hairline shadow-card text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex p-3 rounded-full bg-semantic-flagged/10 border border-semantic-flagged/25 text-semantic-flagged shadow-subtle mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="text-eyebrow font-medium uppercase tracking-wider text-semantic-flagged">
            Runtime Exception
          </div>
          <h1 className="font-serif text-heading-lg text-ink font-normal tracking-tight">
            Unexpected Reversal
          </h1>
          <p className="text-xs text-muted leading-relaxed break-words font-mono bg-subtle p-3 rounded-card border border-hairline">
            {error.message || "An unhandled execution or state reversal occurred."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => reset()}
            className="w-full justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Retry execution</span>
          </Button>

          <Link href="/" className="w-full">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="w-full justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Return home</span>
            </Button>
          </Link>
        </div>

        <div className="pt-3 border-t border-hairline text-[10px] font-mono text-faint">
          Session Recoverable • Cryptographic Protocol Integrity Preserved
        </div>
      </Card>
    </div>
  );
}
