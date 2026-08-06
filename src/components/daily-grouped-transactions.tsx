"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import type { Transaction } from "@/lib/types";

function dayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function DailyGroupedTransactions({
  transactions,
  onDelete,
  emptyMessage = "No transactions yet.",
}: {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}) {
  const { format } = useCurrency();

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const day = t.occurredAt.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(([day, items]) => {
        const dayTotal = items.reduce((sum, t) => sum + BigInt(t.amount), 0n);
        return (
          <div key={day}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {dayLabel(day)}
              </span>
              <span className="tabular-nums text-xs text-text-muted">
                {format(dayTotal)}
              </span>
            </div>
            <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
              {items.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.category.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {t.category.name}
                      {t.note ? (
                        <span className="font-normal text-text-muted"> · {t.note}</span>
                      ) : null}
                    </div>
                    {t.paymentMethod ? (
                      <div className="text-xs text-text-muted">{t.paymentMethod}</div>
                    ) : null}
                  </div>
                  <div
                    className={`tabular-nums shrink-0 text-sm font-semibold ${
                      t.type === "income" ? "text-positive" : "text-negative"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {format(t.amount)}
                  </div>
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(t.id)}
                      className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:text-negative"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
