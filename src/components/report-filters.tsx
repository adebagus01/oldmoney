"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Category } from "@/lib/types";

export type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export function ReportFilters({
  categories,
  categoryId,
  onCategoryChange,
  sort,
  onSortChange,
}: {
  categories: Category[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const hasActiveFilters = categoryId !== "" || sort !== "date_desc";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-border bg-surface text-text-muted outline-none transition-colors hover:text-text-primary"
        aria-label={t("reports.filters")}
      >
        <SlidersHorizontal size={18} />
        {hasActiveFilters ? (
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 w-60 rounded-xl border border-border bg-surface-raised p-3 shadow-lg">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("reports.filterCategory")}
            </label>
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text-primary outline-none md:text-sm"
            >
              <option value="">{t("reports.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("reports.filterSort")}
            </label>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text-primary outline-none md:text-sm"
            >
              <option value="date_desc">{t("reports.sortNewest")}</option>
              <option value="date_asc">{t("reports.sortOldest")}</option>
              <option value="amount_desc">{t("reports.sortHighest")}</option>
              <option value="amount_asc">{t("reports.sortLowest")}</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
