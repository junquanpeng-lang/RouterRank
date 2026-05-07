"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ToastShape {
  show: (msg: string, ttl?: number) => void;
}

const ToastCtx = createContext<ToastShape | null>(null);

export const useToast = (): ToastShape => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

interface ToastItem {
  id: number;
  msg: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((msg: string, ttl = 2400) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, msg }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, ttl);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-ink-700 text-bone border border-ink-500 px-4 py-2 text-[13px] shadow-lg fade-up pointer-events-auto"
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
