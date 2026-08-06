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
    <div className="flex items-center justify-center gap-2 py-6">
      <span
        className="tabular-nums text-3xl font-medium text-text-muted"
        aria-hidden
      >
        Rp
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
        className={`tabular-nums w-full max-w-xs bg-transparent text-center text-5xl font-semibold outline-none placeholder:text-text-muted/40 ${
          positive ? "text-positive" : "text-negative"
        }`}
      />
    </div>
  );
});
