"use client";

import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { translatePaymentMethod, localeFor } from "@/lib/i18n";
import { TransactionRowMenu } from "@/components/transaction-row-menu";
import type { Transaction } from "@/lib/types";

function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  emptyMessage,
}: {
  transactions: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  emptyMessage?: string;
}) {
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const locale = localeFor(language);
  const resolvedEmptyMessage = emptyMessage ?? t("add.noTransactionsYet");

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        {resolvedEmptyMessage}
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
            <div className="text-xs text-text-muted">
              {formatDate(t.occurredAt, locale)}
              {t.paymentMethod ? ` · ${translatePaymentMethod(t.paymentMethod, language)}` : ""}
            </div>
          </div>
          <div
            className={`tabular-nums shrink-0 text-sm font-semibold ${
              t.type === "income" ? "text-positive" : "text-negative"
            }`}
          >
            {t.type === "income" ? "+" : "-"}
            {format(t.amount)}
          </div>
          <TransactionRowMenu
            onEdit={onEdit ? () => onEdit(t) : undefined}
            onDelete={onDelete ? () => onDelete(t) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
