"use client";

import { useState } from "react";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";
import { currentMonthKey, monthKeyLabel } from "@/lib/money";
import { localeFor } from "@/lib/i18n";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { RecapStoryViewer, type RecapSlide } from "@/components/recap-story-viewer";
import { buildAllTimeSlides, buildMonthlySlides } from "@/lib/recap-slides";
import type { MonthlyRecap, AllTimeRecap } from "@/lib/types";

type Mode = "monthly" | "all-time";

export default function RecapPage() {
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const locale = localeFor(language);
  const month = currentMonthKey();
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);
  const [slides, setSlides] = useState<RecapSlide[] | null>(null);

  async function start(mode: Mode) {
    setLoadingMode(mode);
    try {
      if (mode === "monthly") {
        const res = await fetch(`/api/recap?mode=monthly&month=${month}`);
        const data: MonthlyRecap = await res.json();
        setSlides(buildMonthlySlides(data, t, format, locale));
      } else {
        const res = await fetch(`/api/recap?mode=all-time`);
        const data: AllTimeRecap = await res.json();
        setSlides(buildAllTimeSlides(data, t, format, locale, language));
      }
    } finally {
      setLoadingMode(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-6 md:py-10">
      <h1 className="mb-1 text-lg font-semibold text-text-primary">{t("recap.pageTitle")}</h1>
      <p className="mb-6 text-sm text-text-muted">{t("recap.pageSubtitle")}</p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => start("monthly")}
          disabled={loadingMode !== null}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-opacity disabled:opacity-60"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-text-primary">{t("recap.monthlyCardTitle")}</div>
            <div className="truncate text-xs text-text-muted">
              {t("recap.monthlyCardSubtitle", { month: monthKeyLabel(month, locale) })}
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-text-muted" />
        </button>

        <button
          type="button"
          onClick={() => start("all-time")}
          disabled={loadingMode !== null}
          className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-opacity disabled:opacity-60"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Trophy size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-text-primary">{t("recap.allTimeCardTitle")}</div>
            <div className="truncate text-xs text-text-muted">{t("recap.allTimeCardSubtitle")}</div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-text-muted" />
        </button>
      </div>

      {slides ? <RecapStoryViewer slides={slides} onClose={() => setSlides(null)} /> : null}
    </div>
  );
}
