"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type ToastState = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  toast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrent(null);
  }, []);

  const toast = useCallback((message: string, options?: ToastOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const id = ++idRef.current;
    setCurrent({
      id,
      message,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
    });
    timeoutRef.current = setTimeout(() => {
      setCurrent((c) => (c?.id === id ? null : c));
    }, options?.duration ?? DEFAULT_DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {current ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-surface-raised px-4 py-2.5 shadow-lg">
            <span className="text-sm text-text-primary">{current.message}</span>
            {current.onAction ? (
              <button
                type="button"
                onClick={() => {
                  current.onAction?.();
                  dismiss();
                }}
                className="text-sm font-semibold text-accent"
              >
                {current.actionLabel ?? "Undo"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
