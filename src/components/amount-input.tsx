"use client";

import { forwardRef } from "react";

function groupDigits(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(BigInt(digits));
}

export const AmountInput = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (rawDigits: string) => void;
  positive?: boolean;
}>(function AmountInput({ value, onChange, positive }, ref) {
  return (
    <div className="border-b-2 border-border py-5 transition-colors focus-within:border-accent">
      <div className="flex items-baseline gap-3">
        <span
          className="text-lg font-semibold tracking-wide text-text-muted"
          aria-hidden
        >
          IDR
        </span>
        <input
          ref={ref}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={groupDigits(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            const trimmed = digits.replace(/^0+(?=\d)/, "");
            onChange(trimmed);
          }}
          className={`tabular-nums min-w-0 flex-1 bg-transparent text-4xl font-bold outline-none placeholder:text-text-muted/40 sm:text-5xl ${
            positive ? "text-positive" : "text-negative"
          }`}
        />
      </div>
    </div>
  );
});
