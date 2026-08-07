"use client";

import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { localeFor } from "@/lib/i18n";
import type { Transaction } from "@/lib/types";

function dateLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function TopExpenses({ transactions }: { transactions: Transaction[] }) {
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const locale = localeFor(language);

  if (transactions.length === 0) {
    return <p className="py-4 text-center text-sm text-text-muted">{t("balance.noTopExpenses")}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((tx, i) => (
        <li key={tx.id} className="flex items-center gap-3 py-3">
          <span className="w-4 shrink-0 text-center text-sm font-semibold text-text-muted">
            {i + 1}
          </span>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: tx.category.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-text-primary">
              {tx.category.name}
              {tx.note ? (
                <span className="font-normal text-text-muted"> · {tx.note}</span>
              ) : null}
            </div>
            <div className="text-xs text-text-muted">{dateLabel(tx.occurredAt, locale)}</div>
          </div>
          <div className="tabular-nums shrink-0 text-sm font-semibold text-negative">
            {format(tx.amount)}
          </div>
        </li>
      ))}
    </ul>
  );
}
