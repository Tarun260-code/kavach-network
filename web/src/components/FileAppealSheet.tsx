"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Input,
  Textarea,
  SegmentedControl,
  HashChip,
  StatusPill,
} from "./ui";
import { useBankSession } from "@/context/BankSessionContext";
import { getBankSigner, getAppealDAOContract, decodeContractError } from "@/lib/web3";
import { getNetworkMode } from "@/lib/dataProvider";
import { useToast } from "./Toast";
import { ActiveFlagItem } from "@/hooks/useRegistryEvents";
import { Scale, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileAppealSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeFlags: ActiveFlagItem[];
  onSuccess?: () => void;
}

export function FileAppealSheet({
  isOpen,
  onClose,
  activeFlags,
  onSuccess,
}: FileAppealSheetProps) {
  const { bank } = useBankSession();
  const { showToast } = useToast();

  const [selectedLeaf, setSelectedLeaf] = useState<string>(
    activeFlags[0]?.leaf || "0x19a99ebe56c12cf3452243d789e9000a68d0ee409998188e7b99c85589de6d"
  );
  const [reason, setReason] = useState<string>("Wrongful flag");
  const [evidenceCid, setEvidenceCid] = useState<string>(
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  );
  const [statement, setStatement] = useState<string>(
    "Customer verified in branch with primary biometric verification. Confirmed non-fraudulent applicant with legitimate multi-bank inquiry."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");

  const handleUseDemoEvidence = () => {
    setEvidenceCid("ipfs://bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedfdietkwfeuza5gnvx5qai");
    setStatement(
      "Branch manager audited physical documents. False positive match caused by duplicate synthetic demographic profile."
    );
  };

  const handleSubmit = async () => {
    if (!selectedLeaf) {
      showToast({
        title: "Leaf Required",
        message: "Please select an active identity commitment leaf to dispute.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const signer = getBankSigner(bank.id);
      const dao = getAppealDAOContract(signer);

      const leafBig = BigInt(selectedLeaf);
      const tx = await dao.createAppeal(leafBig, evidenceCid);
      await tx.wait();

      showToast({
        title: "Appeal Filed on Chain",
        message: `Appeal for leaf ${selectedLeaf.slice(0, 10)}... submitted to AppealDAO chamber.`,
        type: "success",
      });

      onSuccess?.();
      onClose();
      setStep("form");
    } catch (err: any) {
      const msg = decodeContractError(err);
      showToast({
        title: "Appeal Submission Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        glass={true}
        className="w-full sm:max-w-lg overflow-y-auto p-6 flex flex-col justify-between"
      >
        <div>
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-full bg-[#A9822F]/10 dark:bg-[#D9B26B]/15 text-[#A9822F] dark:text-[#D9B26B] flex items-center justify-center">
                <Scale className="h-4 w-4 stroke-[1.75]" />
              </div>
              <SheetTitle className="text-xl font-sans font-semibold tracking-[-0.01em] text-ink">
                File a Contested Appeal
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted leading-relaxed">
              Submit verified counter-evidence to dispute an active identity flag in the consortium registry. Requires a 2/3 supermajority vote by peer banks to overturn.
            </SheetDescription>
          </SheetHeader>

          {step === "form" ? (
            <div className="space-y-5">
              {/* Flagged Leaf Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Contested Identity Commitment Leaf
                </label>
                {activeFlags.length > 0 ? (
                  <select
                    value={selectedLeaf}
                    onChange={(e) => setSelectedLeaf(e.target.value)}
                    className="w-full rounded-control border border-hairline bg-surface px-3 py-2.5 text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  >
                    {activeFlags.map((f, idx) => (
                      <option key={f.leaf || idx} value={f.leaf}>
                        {f.leaf.slice(0, 18)}... ({f.categoryName || "Flagged ID"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={selectedLeaf}
                    onChange={(e) => setSelectedLeaf(e.target.value)}
                    placeholder="0x... (32-byte leaf)"
                    className="font-mono text-xs"
                  />
                )}
                <p className="text-[11px] text-muted">
                  The Poseidon commitment currently anchored in the active Merkle tree.
                </p>
              </div>

              {/* Dispute Reason (Segmented Control) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Dispute Grounds
                </label>
                <SegmentedControl
                  value={reason}
                  onChange={setReason}
                  options={[
                    { value: "Wrongful flag", label: "Wrongful flag" },
                    { value: "Data error", label: "Data error" },
                    { value: "Duplicate", label: "Duplicate" },
                  ]}
                />
              </div>

              {/* Evidence Upload Hash */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Counter-Evidence Content Hash
                  </label>
                  <button
                    type="button"
                    onClick={handleUseDemoEvidence}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Use sample KYC proof
                  </button>
                </div>
                <Input
                  value={evidenceCid}
                  onChange={(e) => setEvidenceCid(e.target.value)}
                  placeholder="ipfs://bafy... or sha256 checksum"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted">
                  Cryptographic digest of audited KYC documentation. Plain customer PII is never published on-chain.
                </p>
              </div>

              {/* Underwriter Statement */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Underwriter Case Statement
                </label>
                <Textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  placeholder="Explain why this identity was flagged incorrectly..."
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Protocol Warning */}
              <div className="p-3.5 rounded-card bg-subtle/50 border border-hairline flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-semantic-review shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted leading-relaxed">
                  Filing an appeal initiates a 72-hour adjudication window. Overturning the flag requires consensus from 4 of 5 member banks.
                </p>
              </div>
            </div>
          ) : (
            /* Review Step */
            <div className="space-y-4">
              <div className="p-4 rounded-card border border-hairline bg-surface space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="text-muted">Target Leaf</span>
                  <HashChip hash={selectedLeaf} className="text-[11px]" />
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="text-muted">Dispute Reason</span>
                  <span className="font-semibold text-ink">{reason}</span>
                </div>
                <div className="flex flex-col gap-1 pb-2 border-b border-hairline">
                  <span className="text-muted">Evidence Digest</span>
                  <span className="font-mono text-[11px] text-ink break-all">{evidenceCid}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted">Officer Statement</span>
                  <p className="text-ink leading-relaxed">{statement}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-primary-wash/50 dark:bg-primary-900/20 border border-primary/20 space-y-1">
                <p className="text-xs font-semibold text-primary">Consortium Review Procedure</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Upon broadcasting, an AppealCreated event is registered on the block. Peer bank risk officers will be prompted to inspect evidence and cast an uphold or reject vote.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-hairline flex flex-wrap items-center justify-end gap-3">
          {step === "review" ? (
            <>
              <Button
                variant="outline"
                size="default"
                onClick={() => setStep("form")}
                disabled={isSubmitting}
              >
                Back
              </Button>
              {getNetworkMode() === "replay" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => {
                      showToast({
                        title: "Simulation, not saved",
                        message: `Simulated appeal draft created in memory for leaf ${selectedLeaf.slice(0, 10)}... (Simulation, not saved)`,
                        type: "info",
                      });
                      onClose();
                    }}
                    className="border-dashed border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                    data-testid="simulate-appeal-button"
                  >
                    Try preview: Simulation, not saved
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={async () => {
                      await navigator.clipboard.writeText("pnpm dev");
                      showToast({
                        title: "Command Copied",
                        message: "Copied 'pnpm dev' to clipboard. Run the local chain to broadcast live transactions.",
                        type: "success",
                      });
                    }}
                    className="bg-ink hover:bg-ink/90 text-surface"
                    data-testid="run-locally-submit"
                  >
                    Run locally to submit
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Confirm & broadcast appeal
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="default" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="default"
                onClick={() => setStep("review")}
                disabled={!selectedLeaf || !evidenceCid}
              >
                Review appeal details
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

