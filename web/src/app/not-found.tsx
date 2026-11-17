import Link from "next/link";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Button, Card, MeshBackground } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 selection:bg-brand-sapphire/20 font-sans relative">
      <MeshBackground intensity="subtle" />

      <Card className="w-full max-w-md p-8 bg-surface border-hairline shadow-card text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex p-3 rounded-full bg-subtle border border-hairline text-ink shadow-subtle mx-auto">
          <Shield className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="text-eyebrow font-medium uppercase tracking-wider text-muted">
            Error 404 • Not Found
          </div>
          <h1 className="font-serif text-heading-lg text-ink font-normal tracking-tight">
            Registry Route Not Found
          </h1>
          <p className="text-xs text-muted leading-relaxed">
            The requested consortium resource, member workspace, or audit endpoint does not exist on this network.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/" className="w-full">
            <Button
              type="button"
              variant="primary"
              size="default"
              withOrb
              className="w-full justify-between"
            >
              <span>Return to landing</span>
            </Button>
          </Link>
        </div>

        <div className="pt-3 border-t border-hairline text-[10px] font-mono text-faint">
          Kavach Network Consortium Testnet
        </div>
      </Card>
    </div>
  );
}
