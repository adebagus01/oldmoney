"use client";

import { useEffect, useMemo, useState } from "react";
import { formatIDR } from "@/lib/money";
import { TransactionList } from "@/components/transaction-list";
import type { Category, ReportResponse } from "@/lib/types";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

function todayIso(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function firstOfMonthIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function ReportsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState(firstOfMonthIso());
  const [to, setTo] = useState(todayIso());
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories?type=expense")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (categoryId) params.set("categoryId", categoryId);
    if (from) params.set("from", from);
    if (to) {
      const exclusiveEnd = new Date(to);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      params.set("to", exclusiveEnd.toISOString().slice(0, 10));
    }
    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [categoryId, from, to, sort]);

  function setThisMonth() {
    setFrom(firstOfMonthIso());
    setTo(todayIso());
  }

  const maxBreakdown = useMemo(
    () =>
      data
        ? Math.max(...data.breakdown.map((b) => Number(b.total)), 1)
        : 1,
    [data]
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">Reports</h1>

      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-muted">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-muted">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={setThisMonth}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary"
          >
            This month
          </button>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary outline-none"
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
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary outline-none"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </div>
      </div>

      {loading || !data ? (
        <p className="py-8 text-center text-sm text-text-muted">Loading…</p>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <div className="text-xs text-text-muted">Total spent</div>
            <div className="tabular-nums text-3xl font-bold text-negative">
              {formatIDR(BigInt(data.total))}
            </div>
          </div>

          {data.breakdown.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                By category
              </h2>
              <div className="space-y-2.5">
                {data.breakdown.map((b) => (
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
                        {formatIDR(BigInt(b.total))}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(Number(b.total) / maxBreakdown) * 100}%`,
                          backgroundColor: b.category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Transactions
          </h2>
          <TransactionList
            transactions={data.transactions}
            emptyMessage="No expenses in this range."
          />
        </>
      )}
    </div>
  );
}
