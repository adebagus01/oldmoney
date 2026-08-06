"use client";

import { useEffect, useState } from "react";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";

export function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-28 rounded-full bg-surface-raised" />;
  }

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="rounded-full border border-border bg-surface px-3 py-1.5 text-base font-medium text-text-primary outline-none md:text-xs"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.label}
        </option>
      ))}
    </select>
  );
}
