"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { clsx } from "clsx";

type ToastTone = "neutral" | "positive" | "negative";

type ToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  tone?: ToastTone;
};

type ToastState = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

const TONE_CLASSES: Record<ToastTone, string> = {
  neutral: "border-border bg-surface-raised text-text-primary",
  positive: "border-positive/30 bg-positive/10 text-positive",
  negative: "border-negative/30 bg-negative/10 text-negative",
};

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
      tone: options?.tone ?? "neutral",
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
          <div
            className={clsx(
              "pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg",
              TONE_CLASSES[current.tone]
            )}
          >
            <span className="text-sm font-medium">{current.message}</span>
            {current.onAction ? (
              <button
                type="button"
                onClick={() => {
                  current.onAction?.();
                  dismiss();
                }}
                className={clsx(
                  "text-sm font-semibold",
                  current.tone === "neutral" ? "text-accent" : "underline underline-offset-2"
                )}
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
