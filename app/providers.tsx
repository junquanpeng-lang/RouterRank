"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/contexts/theme";
import { LangProvider } from "@/lib/contexts/lang";
import { WalletProvider } from "@/lib/contexts/wallet";
import { ToastProvider } from "@/lib/contexts/toast";
import { DataProvider } from "@/lib/contexts/data";
import { WalletConnectModal } from "@/components/wallet/wallet-connect-modal";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <WalletProvider>
          <ToastProvider>
            <DataProvider>
              {children}
              <WalletConnectModal />
            </DataProvider>
          </ToastProvider>
        </WalletProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
