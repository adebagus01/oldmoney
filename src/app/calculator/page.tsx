"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { localeFor, type TranslationKey } from "@/lib/i18n";
import { monthsToGoal, addMonthsUTC, monthYearLabel } from "@/lib/forecast";
import { MoneyField } from "@/components/money-field";
import type { ForecastResponse } from "@/lib/types";

function ResultBox({
  months,
  locale,
  t,
}: {
  months: number | null;
  locale: string;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  if (months === null) {
    return (
      <p className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-negative">
        {t("calculator.cannotReach")}
      </p>
    );
  }
  if (months === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-positive">
        {t("calculator.alreadyReached")}
      </p>
    );
  }
  const targetDate = addMonthsUTC(new Date(), months);
  return (
    <div className="rounded-lg border border-border bg-surface-raised px-3 py-2.5">
      <div className="text-sm font-semibold text-text-primary">
        {t("calculator.monthsToGo", { count: months })}
      </div>
      <div className="text-xs text-text-muted">
        {t("calculator.estimatedDate", { date: monthYearLabel(targetDate, locale) })}
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const locale = localeFor(language);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [goal, setGoal] = useState("");

  useEffect(() => {
    fetch("/api/forecast")
      .then((res) => res.json())
      .then(setForecast);
  }, []);

  const forecastMonths = useMemo(() => {
    if (!forecast || !goal) return undefined;
    return monthsToGoal(BigInt(forecast.currentBalance), BigInt(forecast.avgMonthlySavings), BigInt(goal));
  }, [forecast, goal]);

  const [startBalance, setStartBalance] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [manualGoal, setManualGoal] = useState("");

  const manualSavings = useMemo(
    () => (BigInt(monthlyIncome || "0") - BigInt(monthlyExpenses || "0")).toString(),
    [monthlyIncome, monthlyExpenses]
  );

  const manualMonths = useMemo(() => {
    if (!manualGoal) return undefined;
    return monthsToGoal(BigInt(startBalance || "0"), BigInt(manualSavings), BigInt(manualGoal));
  }, [startBalance, manualSavings, manualGoal]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">{t("calculator.title")}</h1>

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-text-primary">{t("calculator.forecastTitle")}</h2>
        <p className="mb-4 text-xs text-text-muted">{t("calculator.forecastSubtitle")}</p>

        {!forecast ? (
          <p className="py-4 text-center text-sm text-text-muted">{t("common.loading")}</p>
        ) : forecast.monthsOfData === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-text-muted">
            {t("calculator.notEnoughData")}
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-muted">{t("calculator.currentBalance")}</div>
                <div className="tabular-nums text-base font-semibold text-text-primary">
                  {format(forecast.currentBalance)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">{t("calculator.avgMonthlySavings")}</div>
                <div
                  className={clsx(
                    "tabular-nums text-base font-semibold",
                    BigInt(forecast.avgMonthlySavings) > 0n
                      ? "text-positive"
                      : BigInt(forecast.avgMonthlySavings) < 0n
                        ? "text-negative"
                        : "text-text-primary"
                  )}
                >
                  {format(forecast.avgMonthlySavings)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">{t("calculator.avgMonthlyIncome")}</div>
                <div className="tabular-nums text-sm text-text-primary">
                  {format(forecast.avgMonthlyIncome)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">{t("calculator.avgMonthlyExpenses")}</div>
                <div className="tabular-nums text-sm text-text-primary">
                  {format(forecast.avgMonthlyExpenses)}
                </div>
              </div>
            </div>
            <p className="mb-4 text-xs text-text-muted">
              {t("calculator.basedOnMonths", { count: forecast.monthsOfData })}
            </p>

            <div className="mb-4">
              <MoneyField label={t("calculator.goalAmount")} value={goal} onChange={setGoal} />
            </div>

            {forecastMonths === undefined ? (
              <p className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-text-muted">
                {t("calculator.enterGoal")}
              </p>
            ) : (
              <ResultBox months={forecastMonths} locale={locale} t={t} />
            )}
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-text-primary">{t("calculator.manualTitle")}</h2>
        <p className="mb-4 text-xs text-text-muted">{t("calculator.manualSubtitle")}</p>

        <div className="mb-4 flex flex-col gap-4">
          <MoneyField
            label={t("calculator.startingBalance")}
            value={startBalance}
            onChange={setStartBalance}
          />
          <MoneyField
            label={t("calculator.monthlyIncome")}
            value={monthlyIncome}
            onChange={setMonthlyIncome}
          />
          <MoneyField
            label={t("calculator.monthlyExpenses")}
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
          />
          <MoneyField label={t("calculator.goalAmount")} value={manualGoal} onChange={setManualGoal} />
        </div>

        <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-text-muted">{t("calculator.monthlySavings")}</span>
          <span
            className={clsx(
              "tabular-nums text-sm font-semibold",
              BigInt(manualSavings) > 0n
                ? "text-positive"
                : BigInt(manualSavings) < 0n
                  ? "text-negative"
                  : "text-text-primary"
            )}
          >
            {format(manualSavings)}
          </span>
        </div>

        {manualMonths === undefined ? (
          <p className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-text-muted">
            {t("calculator.enterGoal")}
          </p>
        ) : (
          <ResultBox months={manualMonths} locale={locale} t={t} />
        )}
      </section>
    </div>
  );
}
