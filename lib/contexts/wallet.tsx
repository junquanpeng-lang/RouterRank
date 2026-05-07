"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Wallet } from "../types";

interface WalletCtxShape {
  wallet: Wallet | null;
  showConnect: boolean;
  setShowConnect: (v: boolean) => void;
  connect: () => void;
  disconnect: () => void;
}

const WalletCtx = createContext<WalletCtxShape | null>(null);

export const useWallet = (): WalletCtxShape => {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};

const MOCK_WALLET: Wallet = {
  address: "0x7a3F…e9b2",
  full: "0x7a3Faa1b29C4b9bDc40d9cA1B7E9F2a6cD4E9b2",
  balance: 142.38,
  chain: "Base",
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  const connect = useCallback(() => {
    setWallet(MOCK_WALLET);
    setShowConnect(false);
  }, []);

  const disconnect = useCallback(() => setWallet(null), []);

  const value = useMemo(
    () => ({ wallet, showConnect, setShowConnect, connect, disconnect }),
    [wallet, showConnect, connect, disconnect],
  );

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}
