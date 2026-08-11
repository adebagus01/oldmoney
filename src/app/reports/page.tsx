"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { currentMonthKey, monthKeyLabel, shiftMonthKey, toMonthRange } from "@/lib/money";
import { localeFor, translatePaymentMethod } from "@/lib/i18n";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/components/toast-provider";
import { useDeleteWithUndo } from "@/lib/use-delete-with-undo";
import { DailyGroupedTransactions } from "@/components/daily-grouped-transactions";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import type { Category, CategoryTotal, ReportResponse, Transaction, TransactionType } from "@/lib/types";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export default function ReportsPage() {
  const [type, setType] = useState<TransactionType>("expense");
  const [month, setMonth] = useState(currentMonthKey());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { visibleTransactions, requestDelete } = useDeleteWithUndo(data?.transactions ?? []);

  const searchedTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visibleTransactions;
    return visibleTransactions.filter((tx) => {
      const haystack = [
        tx.category.name,
        tx.note ?? "",
        tx.paymentMethod ?? "",
        tx.paymentMethod ? translatePaymentMethod(tx.paymentMethod, language) : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [visibleTransactions, search, language]);

  const isCurrentMonth = month === currentMonthKey();

  useEffect(() => {
    setCategoryId("");
    fetch(`/api/categories?type=${type}`)
      .then((res) => res.json())
      .then(setCategories);
  }, [type]);

  const loadReport = useCallback(() => {
    setLoading(true);
    const { start, end } = toMonthRange(month);
    const params = new URLSearchParams({
      type,
      sort,
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
    if (categoryId) params.set("categoryId", categoryId);
    return fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [type, month, categoryId, sort]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const total = useMemo(
    () => searchedTransactions.reduce((sum, t) => sum + BigInt(t.amount), 0n).toString(),
    [searchedTransactions]
  );

  const breakdown = useMemo<CategoryTotal[]>(() => {
    const map = new Map<string, { category: Category; total: bigint }>();
    for (const t of searchedTransactions) {
      const existing = map.get(t.category.id);
      if (existing) existing.total += BigInt(t.amount);
      else map.set(t.category.id, { category: t.category, total: BigInt(t.amount) });
    }
    return Array.from(map.values())
      .map((b) => ({ category: b.category, total: b.total.toString() }))
      .sort((a, b) => (BigInt(b.total) > BigInt(a.total) ? 1 : -1));
  }, [searchedTransactions]);

  async function handleSaved() {
    setEditingTransaction(null);
    await loadReport();
    toast(t("add.changesSaved"));
  }

  async function handleReorder(orderedIds: string[]) {
    const res = await fetch("/api/transactions/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: orderedIds }),
    });
    if (!res.ok) {
      toast(t("reports.reorderFailed"));
      await loadReport();
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">{t("reports.title")}</h1>

      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              type === "expense" ? "bg-negative/15 text-negative" : "text-text-muted"
            )}
          >
            {t("add.expense")}
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              type === "income" ? "bg-positive/15 text-positive" : "text-text-muted"
            )}
          >
            {t("add.income")}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
          className="rounded-md p-1.5 text-text-muted hover:text-text-primary"
          aria-label={t("common.previousMonth")}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {monthKeyLabel(month, localeFor(language))}
        </span>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
          disabled={isCurrentMonth}
          className="rounded-md p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30"
          aria-label={t("common.nextMonth")}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-base font-medium text-text-primary outline-none md:text-xs"
        >
          <option value="">{t("reports.allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-base font-medium text-text-primary outline-none md:text-xs"
        >
          <option value="date_desc">{t("reports.sortNewest")}</option>
          <option value="date_asc">{t("reports.sortOldest")}</option>
          <option value="amount_desc">{t("reports.sortHighest")}</option>
          <option value="amount_asc">{t("reports.sortLowest")}</option>
        </select>
      </div>

      <div className="relative mb-6">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("reports.searchPlaceholder")}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pr-9 pl-9 text-base text-text-primary placeholder:text-text-muted outline-none focus:border-accent md:text-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-primary"
            aria-label={t("reports.clearSearch")}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {loading || !data ? (
        <p className="py-8 text-center text-sm text-text-muted">{t("common.loading")}</p>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs text-text-muted">
              {type === "expense" ? t("reports.totalSpent") : t("reports.totalEarned")}
            </div>
            <div
              className={clsx(
                "tabular-nums text-3xl font-bold",
                type === "expense" ? "text-negative" : "text-positive"
              )}
            >
              {format(total)}
            </div>
          </div>

          {breakdown.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("reports.byCategory")}
              </h2>
              <CategoryBreakdown breakdown={breakdown} />
            </div>
          ) : null}

          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("reports.transactions")}
            </h2>
            <span className="text-xs text-text-muted">{t("reports.dragHint")}</span>
          </div>
          <DailyGroupedTransactions
            transactions={searchedTransactions}
            onEdit={setEditingTransaction}
            onDelete={requestDelete}
            onReorder={handleReorder}
            emptyMessage={
              search.trim()
                ? t("reports.noSearchResults")
                : type === "expense"
                  ? t("reports.noExpensesThisMonth")
                  : t("reports.noIncomeThisMonth")
            }
          />
        </>
      )}

      {editingTransaction ? (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
