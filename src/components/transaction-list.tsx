"use client";

import { formatIDR } from "@/lib/money";
import type { Transaction } from "@/lib/types";
import { Trash2 } from "lucide-react";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function TransactionList({
  transactions,
  onDelete,
  emptyMessage = "No transactions yet.",
}: {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center gap-3 py-3">
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
            <div className="text-xs text-text-muted">{formatDate(t.occurredAt)}</div>
          </div>
          <div
            className={`tabular-nums shrink-0 text-sm font-semibold ${
              t.type === "income" ? "text-positive" : "text-negative"
            }`}
          >
            {t.type === "income" ? "+" : "-"}
            {formatIDR(BigInt(t.amount))}
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
  );
}
