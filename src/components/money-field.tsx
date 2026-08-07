"use client";

import { SectionLabel } from "@/components/section-label";

function groupDigits(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(BigInt(digits));
}

export function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (rawDigits: string) => void;
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3.5 focus-within:border-accent">
        <span className="text-sm font-semibold text-text-muted" aria-hidden>
          IDR
        </span>
        <input
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={groupDigits(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "");
            const trimmed = digits.replace(/^0+(?=\d)/, "");
            onChange(trimmed);
          }}
          className="tabular-nums min-w-0 flex-1 bg-transparent text-base font-semibold text-text-primary outline-none placeholder:text-text-muted/40 md:text-sm"
        />
      </div>
    </div>
  );
}
