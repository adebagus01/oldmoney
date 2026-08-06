"use client";

import { CategoryManager } from "@/components/category-manager";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyPicker } from "@/components/currency-picker";
import { useCurrency } from "@/components/currency-provider";

export default function SettingsPage() {
  const { currency } = useCurrency();

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="mb-6 text-lg font-semibold text-text-primary">Settings</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Preferences</h2>
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">Theme</div>
              <div className="text-xs text-text-muted">Dark by default, switch anytime.</div>
            </div>
            <ThemeToggle />
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">Currency</div>
                <div className="text-xs text-text-muted">
                  Display only — amounts are always entered and stored in Rupiah.
                </div>
              </div>
              <CurrencyPicker />
            </div>
            {currency !== "IDR" ? (
              <p className="mt-3 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
                Showing everything converted to {currency} at an approximate,
                fixed rate — not a live exchange rate. Switch back to IDR
                anytime to see the exact original Rupiah amounts.
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="text-sm text-text-primary">Export data</div>
              <div className="text-xs text-text-muted">Download every transaction you&apos;ve logged.</div>
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
          Expense categories
        </h2>
        <CategoryManager type="expense" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          Income categories
        </h2>
        <CategoryManager type="income" />
      </section>
    </div>
  );
}
