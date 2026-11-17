"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { FederatedSimulationView } from "@/components/FederatedSimulationView";

export default function FederatedIntelligenceRedirectPage() {
  return (
    <AppShell pageTitle="Federated Intelligence (Simulation)">
      <div className="space-y-6 max-w-6xl mx-auto">
        <FederatedSimulationView />
      </div>
    </AppShell>
  );
}
