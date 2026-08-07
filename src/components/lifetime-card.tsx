"use client";

import { useState } from "react";
import { Infinity as InfinityIcon, Wallet, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";

export function LifetimeCard({
  income,
  expenses,
  net,
}: {
  income: string;
  expenses: string;
  net: string;
}) {
  const [open, setOpen] = useState(true);
  const { format } = useCurrency();
  const { t } = useLanguage();

  const incomeNum = Number(income);
  const netNum = Number(net);
  const savedPct = incomeNum > 0 ? Math.min(Math.max((netNum / incomeNum) * 100, 0), 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <InfinityIcon size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{t("balance.allTime")}</div>
            <div className="text-xs text-text-muted">{t("balance.accumulatedSince")}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary"
        >
          {open ? t("balance.hide") : t("balance.show")}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {open ? (
        <div className="mt-5">
          <div className="rounded-xl border border-positive/25 bg-positive/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface text-positive">
                <Wallet size={13} />
              </span>
              {t("balance.netBalanceAllTime")}
            </div>
            <div className="tabular-nums text-3xl font-bold text-text-primary">
              {format(net)}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-positive transition-all"
                style={{ width: `${savedPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-text-muted">
              {incomeNum > 0
                ? t("balance.keptPercent", { pct: savedPct.toFixed(0) })
                : t("balance.noIncomeYet")}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-raised p-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <TrendingUp size={13} className="text-positive" />
                {t("balance.income")}
              </div>
              <div className="tabular-nums text-lg font-semibold text-positive">
                {format(income)}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-raised p-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <TrendingDown size={13} className="text-negative" />
                {t("balance.expenses")}
              </div>
              <div className="tabular-nums text-lg font-semibold text-negative">
                {format(expenses)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
