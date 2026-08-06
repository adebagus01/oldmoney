"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";

export function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return <div className="h-9 w-20 rounded-full bg-surface-raised" />;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary outline-none"
      >
        {currency}
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open ? (
        <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface-raised py-1 shadow-lg">
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-surface",
                  c.code === currency ? "text-text-primary" : "text-text-muted"
                )}
              >
                <span>
                  <span className="font-semibold">{c.code}</span>
                  <span className="text-text-muted"> — {c.label}</span>
                </span>
                {c.code === currency ? (
                  <Check size={14} className="shrink-0 text-accent" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
