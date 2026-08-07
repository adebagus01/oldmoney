"use client";

import { useMemo } from "react";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import type { CategoryTotal } from "@/lib/types";

export function CategoryBreakdown({
  breakdown,
  emptyMessage,
}: {
  breakdown: CategoryTotal[];
  emptyMessage?: string;
}) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const resolvedEmptyMessage = emptyMessage ?? t("reports.noBreakdownYet");
  const max = useMemo(
    () => Math.max(...breakdown.map((b) => Number(b.total)), 1),
    [breakdown]
  );

  if (breakdown.length === 0) {
    return <p className="py-4 text-center text-sm text-text-muted">{resolvedEmptyMessage}</p>;
  }

  return (
    <div className="space-y-2.5">
      {breakdown.map((b) => (
        <div key={b.category.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-primary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: b.category.color }}
              />
              {b.category.name}
            </span>
            <span className="tabular-nums text-text-muted">
              {format(b.total)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(Number(b.total) / max) * 100}%`,
                backgroundColor: b.category.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
