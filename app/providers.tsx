"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/contexts/theme";
import { LangProvider } from "@/lib/contexts/lang";
import { WalletProvider } from "@/lib/contexts/wallet";
import { ToastProvider } from "@/lib/contexts/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <WalletProvider>
          <ToastProvider>{children}</ToastProvider>
        </WalletProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
