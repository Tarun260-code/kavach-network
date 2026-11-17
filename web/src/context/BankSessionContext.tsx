"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { CONSORTIUM_BANKS, getBankById, BankConfig } from "../lib/banks";
import { getProvider, getBankSigner, getFraudRegistryContract } from "../lib/web3";

export interface BankSessionContextType {
  bank: BankConfig;
  bankId: string;
  setBankId: (id: string) => void;
  address: string;
  accountIndex: number;
  balance: string;
  isAuthorized: boolean;
  devLabel: string;
  signer: ethers.Wallet | null;
  refreshBalance: () => Promise<void>;
}

const BankSessionContext = createContext<BankSessionContextType | null>(null);

export function BankSessionProvider({
  children,
  initialBankId = "meridian",
}: {
  children: React.ReactNode;
  initialBankId?: string;
}) {
  const [bankId, setBankIdState] = useState<string>(initialBankId);
  const [balance, setBalance] = useState<string>("10,000.00 ETH");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  const bank = useMemo(() => {
    return getBankById(bankId) || CONSORTIUM_BANKS.meridian;
  }, [bankId]);

  const signer = useMemo(() => {
    try {
      return getBankSigner(bank.id);
    } catch {
      return null;
    }
  }, [bank.id]);

  const devLabel = useMemo(() => {
    const shortAddr = `${bank.address.slice(0, 6)}...${bank.address.slice(-4)}`;
    return `Dev Signer: Account #${bank.accountIndex} (${shortAddr})`;
  }, [bank.accountIndex, bank.address]);

  const refreshBalance = useCallback(async () => {
    try {
      const provider = getProvider();
      const bal = await provider.getBalance(bank.address);
      const ethVal = parseFloat(ethers.formatEther(bal)).toFixed(2);
      setBalance(`${ethVal} ETH`);

      const registry = getFraudRegistryContract(provider);
      const auth = await registry.isAuthorizedBank(bank.address);
      setIsAuthorized(auth);
    } catch {
      // Fallback in dev/offline
      setBalance("10,000.00 ETH");
      setIsAuthorized(true);
    }
  }, [bank.address]);

  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 5000);
    return () => clearInterval(interval);
  }, [refreshBalance]);

  const setBankId = useCallback((newId: string) => {
    setBankIdState(newId);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-bank", newId);
    }
  }, []);

  return (
    <BankSessionContext.Provider
      value={{
        bank,
        bankId,
        setBankId,
        address: bank.address,
        accountIndex: bank.accountIndex,
        balance,
        isAuthorized,
        devLabel,
        signer,
        refreshBalance,
      }}
    >
      {children}
    </BankSessionContext.Provider>
  );
}

export function useBankSession() {
  const context = useContext(BankSessionContext);
  if (!context) {
    throw new Error("useBankSession must be used within a BankSessionProvider");
  }
  return context;
}

