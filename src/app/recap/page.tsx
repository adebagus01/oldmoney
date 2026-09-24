"use client";

import { useState } from "react";
import { Loader2, Play, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { currentMonthKey, monthKeyLabel } from "@/lib/money";
import { localeFor } from "@/lib/i18n";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { RecapStoryViewer, type RecapSlide } from "@/components/recap-story-viewer";
import { buildAllTimeSlides, buildMonthlySlides } from "@/lib/recap-slides";
import type { MonthlyRecap, AllTimeRecap } from "@/lib/types";

type Mode = "monthly" | "all-time";

function RecapCard({
  title,
  subtitle,
  cta,
  icon: Icon,
  from,
  to,
  glow,
  loading,
  disabled,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  icon: LucideIcon;
  from: string;
  to: string;
  glow: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative isolate h-40 overflow-hidden rounded-3xl p-5 text-left text-white shadow-xl transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div
        className="recap-blob pointer-events-none absolute -top-16 -right-10 -z-10 h-52 w-52 rounded-full opacity-70 mix-blend-screen blur-2xl"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 65%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(to left, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to left, black, transparent 70%)",
        }}
      />

      <div className="absolute top-1/2 right-6 -translate-y-1/2" style={{ perspective: "700px" }}>
        <div className="recap-tile flex h-20 w-20 items-center justify-center rounded-3xl border border-white/40 bg-white/15 shadow-2xl backdrop-blur-md">
          <Icon size={36} strokeWidth={1.7} className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" />
        </div>
      </div>

      <div className="flex h-full max-w-[60%] flex-col justify-between">
        <div>
          <div className="text-xl font-extrabold tracking-tight">{title}</div>
          <div className="mt-1 text-xs text-white/80">{subtitle}</div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors group-hover:bg-white/30">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} className="fill-white" />}
          {cta}
        </span>
      </div>
    </button>
  );
}

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

      <div className="flex flex-col gap-4">
        <RecapCard
          title={t("recap.monthlyCardTitle")}
          subtitle={t("recap.monthlyCardSubtitle", { month: monthKeyLabel(month, locale) })}
          cta={t("recap.startButton")}
          icon={Sparkles}
          from="#2e1065"
          to="#7c3aed"
          glow="#ec4899"
          loading={loadingMode === "monthly"}
          disabled={loadingMode !== null}
          onClick={() => start("monthly")}
        />
        <RecapCard
          title={t("recap.allTimeCardTitle")}
          subtitle={t("recap.allTimeCardSubtitle")}
          cta={t("recap.startButton")}
          icon={Trophy}
          from="#431407"
          to="#d97706"
          glow="#facc15"
          loading={loadingMode === "all-time"}
          disabled={loadingMode !== null}
          onClick={() => start("all-time")}
        />
      </div>

      {slides ? <RecapStoryViewer slides={slides} onClose={() => setSlides(null)} /> : null}
    </div>
  );
}
