"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonthKey, monthKeyLabel, shiftMonthKey, toMonthRange } from "@/lib/money";
import { useCurrency } from "@/components/currency-provider";
import { useToast } from "@/components/toast-provider";
import { DailyGroupedTransactions } from "@/components/daily-grouped-transactions";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import type { Category, CategoryTotal, ReportResponse, Transaction, TransactionType } from "@/lib/types";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

const DELETE_UNDO_WINDOW_MS = 4000;

export default function ReportsPage() {
  const [type, setType] = useState<TransactionType>("expense");
  const [month, setMonth] = useState(currentMonthKey());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { format } = useCurrency();
  const { toast } = useToast();

  const isCurrentMonth = month === currentMonthKey();

  useEffect(() => {
    setCategoryId("");
    fetch(`/api/categories?type=${type}`)
      .then((res) => res.json())
      .then(setCategories);
  }, [type]);

  const loadReport = useCallback(() => {
    setLoading(true);
    setPendingDeleteIds(new Set());
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

  const visibleTransactions = useMemo(
    () => data?.transactions.filter((t) => !pendingDeleteIds.has(t.id)) ?? [],
    [data, pendingDeleteIds]
  );

  const total = useMemo(
    () => visibleTransactions.reduce((sum, t) => sum + BigInt(t.amount), 0n).toString(),
    [visibleTransactions]
  );

  const breakdown = useMemo<CategoryTotal[]>(() => {
    const map = new Map<string, { category: Category; total: bigint }>();
    for (const t of visibleTransactions) {
      const existing = map.get(t.category.id);
      if (existing) existing.total += BigInt(t.amount);
      else map.set(t.category.id, { category: t.category, total: BigInt(t.amount) });
    }
    return Array.from(map.values())
      .map((b) => ({ category: b.category, total: b.total.toString() }))
      .sort((a, b) => (BigInt(b.total) > BigInt(a.total) ? 1 : -1));
  }, [visibleTransactions]);

  function handleDelete(id: string) {
    const target = data?.transactions.find((t) => t.id === id);
    if (!target) return;

    setPendingDeleteIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(async () => {
      deleteTimers.current.delete(id);
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    }, DELETE_UNDO_WINDOW_MS);
    deleteTimers.current.set(id, timer);

    const label = target.note ? `${target.category.name} · ${target.note}` : target.category.name;
    toast(`Deleted "${label}"`, {
      actionLabel: "Undo",
      duration: DELETE_UNDO_WINDOW_MS,
      onAction: () => {
        const pendingTimer = deleteTimers.current.get(id);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          deleteTimers.current.delete(id);
        }
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  }

  async function handleSaved() {
    setEditingTransaction(null);
    await loadReport();
    toast("Changes saved");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">Reports</h1>

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
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              type === "income" ? "bg-positive/15 text-positive" : "text-text-muted"
            )}
          >
            Income
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
          className="rounded-md p-1.5 text-text-muted hover:text-text-primary"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {monthKeyLabel(month)}
        </span>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
          disabled={isCurrentMonth}
          className="rounded-md p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30"
          aria-label="Next month"
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
          <option value="">All categories</option>
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
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
      </div>

      {loading || !data ? (
        <p className="py-8 text-center text-sm text-text-muted">Loading…</p>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs text-text-muted">
              {type === "expense" ? "Total spent" : "Total earned"}
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
                By category
              </h2>
              <CategoryBreakdown breakdown={breakdown} />
            </div>
          ) : null}

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Transactions
          </h2>
          <DailyGroupedTransactions
            transactions={visibleTransactions}
            onEdit={setEditingTransaction}
            onDelete={handleDelete}
            emptyMessage={`No ${type === "expense" ? "expenses" : "income"} this month.`}
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
