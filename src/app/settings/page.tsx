"use client";

import { CategoryManager } from "@/components/category-manager";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyPicker } from "@/components/currency-picker";
import { LanguagePicker } from "@/components/language-picker";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";

export default function SettingsPage() {
  const { currency } = useCurrency();
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">{t("settings.title")}</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">{t("settings.preferences")}</h2>
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">{t("settings.theme")}</div>
              <div className="text-xs text-text-muted">{t("settings.themeSubtitle")}</div>
            </div>
            <ThemeToggle />
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">{t("settings.language")}</div>
                <div className="text-xs text-text-muted">{t("settings.languageSubtitle")}</div>
              </div>
              <LanguagePicker />
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">{t("settings.currency")}</div>
                <div className="text-xs text-text-muted">
                  {t("settings.currencySubtitle")}
                </div>
              </div>
              <CurrencyPicker />
            </div>
            {currency !== "IDR" ? (
              <p className="mt-3 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
                {t("settings.currencyNote", { code: currency })}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="text-sm text-text-primary">{t("settings.exportData")}</div>
              <div className="text-xs text-text-muted">{t("settings.exportSubtitle")}</div>
            </div>
            <div className="flex gap-2">
              <a
                href="/api/export?format=csv"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary"
              >
                CSV
              </a>
              <a
                href="/api/export?format=json"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary"
              >
                JSON
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          {t("settings.expenseCategories")}
        </h2>
        <CategoryManager type="expense" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          {t("settings.incomeCategories")}
        </h2>
        <CategoryManager type="income" />
      </section>
    </div>
  );
}
