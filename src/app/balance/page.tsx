"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { currentMonthKey, monthKeyLabel, shiftMonthKey } from "@/lib/money";
import { useCurrency } from "@/components/currency-provider";
import { LifetimeCard } from "@/components/lifetime-card";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { DailyTrendChart } from "@/components/daily-trend-chart";
import type { BalanceResponse } from "@/lib/types";

export default function BalancePage() {
  const [month, setMonth] = useState(currentMonthKey());
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/balance?month=${month}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [month]);

  const isCurrentMonth = month === currentMonthKey();

  return (
    <div className="mx-auto max-w-xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">Balance</h1>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
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

      {data && !loading ? (
        <>
          {data.lifetime.income === "0" && data.lifetime.expenses === "0" ? (
            <p className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
              No transactions yet — add your first expense or income to see your
              numbers here.
            </p>
          ) : null}

          <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
              This month
            </h2>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-muted">Income</div>
                <div className="tabular-nums text-xl font-semibold text-positive">
                  {format(data.monthly.income)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Expenses</div>
                <div className="tabular-nums text-xl font-semibold text-negative">
                  {format(data.monthly.expenses)}
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-xs text-text-muted">Remaining</div>
              <div className="tabular-nums text-3xl font-bold text-text-primary">
                {format(data.monthly.remaining)}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <div>
                <div className="text-xs text-text-muted">Average daily spend</div>
                <div className="tabular-nums text-xl font-semibold text-text-primary">
                  {format(data.averageDailySpend.current)}
                </div>
              </div>
              {data.averageDailySpend.changePct !== null ? (
                <div
                  className={clsx(
                    "flex items-center gap-1 text-sm font-semibold",
                    data.averageDailySpend.changePct > 0
                      ? "text-negative"
                      : data.averageDailySpend.changePct < 0
                        ? "text-positive"
                        : "text-text-muted"
                  )}
                >
                  {data.averageDailySpend.changePct > 0 ? (
                    <ArrowUp size={14} />
                  ) : data.averageDailySpend.changePct < 0 ? (
                    <ArrowDown size={14} />
                  ) : null}
                  {Math.abs(data.averageDailySpend.changePct).toFixed(0)}% vs last month
                </div>
              ) : null}
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Daily spending
            </h2>
            <DailyTrendChart data={data.dailyExpenses} />
          </section>

          {data.categoryBreakdown.length > 0 ? (
            <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Spending by category
              </h2>
              <CategoryBreakdown breakdown={data.categoryBreakdown} />
            </section>
          ) : null}

          <LifetimeCard
            income={data.lifetime.income}
            expenses={data.lifetime.expenses}
            net={data.lifetime.net}
          />
        </>
      ) : (
        <p className="py-8 text-center text-sm text-text-muted">Loading…</p>
      )}
    </div>
  );
}
