import {
  CalendarDays,
  Coins,
  CreditCard,
  Crown,
  Flame,
  PartyPopper,
  PiggyBank,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { monthKeyLabel, shiftMonthKey } from "@/lib/money";
import { translatePaymentMethod, type Language, type TranslationKey } from "@/lib/i18n";
import type { AllTimeRecap, MonthlyRecap } from "@/lib/types";
import type { RecapSlide, RecapTheme } from "@/components/recap-story-viewer";

const THEMES: RecapTheme[] = [
  { from: "#1e0b3d", to: "#6d28d9", blobs: ["#a855f7", "#ec4899", "#6366f1"] },
  { from: "#021f1a", to: "#047857", blobs: ["#34d399", "#22d3ee", "#a3e635"] },
  { from: "#2a0612", to: "#be123c", blobs: ["#fb7185", "#f59e0b", "#f472b6"] },
  { from: "#2b1203", to: "#c2410c", blobs: ["#fbbf24", "#fb923c", "#f43f5e"] },
  { from: "#0b1437", to: "#1d4ed8", blobs: ["#60a5fa", "#818cf8", "#22d3ee"] },
  { from: "#2a0730", to: "#a21caf", blobs: ["#e879f9", "#f472b6", "#a78bfa"] },
  { from: "#03201f", to: "#0f766e", blobs: ["#2dd4bf", "#38bdf8", "#bef264"] },
  { from: "#1c1206", to: "#a16207", blobs: ["#facc15", "#f97316", "#fde68a"] },
];

type SlideDraft = Omit<RecapSlide, "theme">;
type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;
type Format = (amount: number | bigint | string) => string;

function withThemes(drafts: SlideDraft[]): RecapSlide[] {
  return drafts.map((draft, i) => ({ ...draft, theme: THEMES[i % THEMES.length] }));
}

function dateLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

export function buildMonthlySlides(
  data: MonthlyRecap,
  t: Translate,
  format: Format,
  locale: string
): RecapSlide[] {
  const monthLabel = monthKeyLabel(data.month, locale);

  if (!data.hasData) {
    return withThemes([
      {
        icon: Sparkles,
        eyebrow: monthLabel,
        value: { kind: "text", text: t("recap.noDataTitle") },
        caption: t("recap.noDataCaption"),
      },
    ]);
  }

  const prevMonthLabel = monthKeyLabel(shiftMonthKey(data.month, -1), locale);
  const netSaved = BigInt(data.netSaved);
  const change = data.expenseChangePct;

  const drafts: SlideDraft[] = [
    {
      icon: Sparkles,
      eyebrow: t("recap.monthlyIntroEyebrow"),
      value: { kind: "text", text: monthLabel },
      caption: t("recap.monthlyIntroCaption"),
      hint: t("recap.tapHint"),
    },
    {
      icon: Wallet,
      eyebrow: t("recap.totalSpentEyebrow"),
      value: { kind: "amount", amount: data.totalExpenses },
      caption:
        change === null
          ? undefined
          : change > 0
            ? t("recap.totalSpentCaptionUp", { pct: change.toFixed(0), prevMonth: prevMonthLabel })
            : change < 0
              ? t("recap.totalSpentCaptionDown", { pct: Math.abs(change).toFixed(0), prevMonth: prevMonthLabel })
              : t("recap.totalSpentCaptionFlat", { prevMonth: prevMonthLabel }),
    },
    {
      icon: TrendingUp,
      eyebrow: t("recap.totalIncomeEyebrow"),
      value: { kind: "amount", amount: data.totalIncome },
    },
    {
      icon: netSaved >= 0n ? PiggyBank : TrendingDown,
      eyebrow: netSaved >= 0n ? t("recap.netSavedEyebrowPositive") : t("recap.netSavedEyebrowNegative"),
      value: { kind: "amount", amount: abs(netSaved).toString() },
    },
  ];

  if (data.topCategory) {
    drafts.push({
      icon: Crown,
      eyebrow: t("recap.topCategoryEyebrow"),
      value: { kind: "text", text: data.topCategory.name, dotColor: data.topCategory.color },
      caption: t("recap.topCategoryCaption", { pct: data.topCategory.percentOfTotal.toFixed(0) }),
    });
  }

  if (data.biggestExpense) {
    drafts.push({
      icon: Flame,
      eyebrow: t("recap.biggestExpenseEyebrow"),
      value: { kind: "amount", amount: data.biggestExpense.amount },
      caption: t("recap.biggestExpenseCaption", {
        category: data.biggestExpense.categoryName,
        date: dateLabel(data.biggestExpense.occurredAt, locale),
      }),
    });
  }

  drafts.push(
    {
      icon: Receipt,
      eyebrow: t("recap.activityEyebrow"),
      value: { kind: "count", count: data.transactionCount },
      caption: t("recap.activityCaption", { days: data.daysWithSpending }),
    },
    {
      icon: CalendarDays,
      eyebrow: t("recap.avgDailyEyebrow"),
      value: { kind: "amount", amount: data.avgDailySpend },
      caption: t("recap.avgDailyCaption"),
    },
    {
      icon: PartyPopper,
      eyebrow: t("recap.monthlyOutroEyebrow"),
      value: { kind: "text", text: monthLabel },
      caption: t("recap.monthlyOutroCaption"),
      summary: [
        { label: t("recap.summarySpent"), value: format(data.totalExpenses) },
        { label: t("recap.summaryIncome"), value: format(data.totalIncome) },
        {
          label: netSaved >= 0n ? t("recap.summarySaved") : t("recap.summaryOverspent"),
          value: format(abs(netSaved)),
        },
        { label: t("recap.summaryTopCategory"), value: data.topCategory?.name ?? "—" },
      ],
    }
  );

  return withThemes(drafts);
}

export function buildAllTimeSlides(
  data: AllTimeRecap,
  t: Translate,
  format: Format,
  locale: string,
  language: Language
): RecapSlide[] {
  if (!data.hasData) {
    return withThemes([
      {
        icon: Trophy,
        eyebrow: t("recap.allTimeCardTitle"),
        value: { kind: "text", text: t("recap.noDataTitle") },
        caption: t("recap.noDataCaption"),
      },
    ]);
  }

  const netBalance = BigInt(data.netBalance);

  const drafts: SlideDraft[] = [
    {
      icon: Trophy,
      eyebrow: t("recap.allTimeIntroEyebrow"),
      value: { kind: "text", text: t("recap.allTimeCardTitle") },
      caption: t("recap.allTimeIntroCaption", { date: dateLabel(data.firstTransactionDate, locale) }),
      hint: t("recap.tapHint"),
    },
    {
      icon: Wallet,
      eyebrow: t("recap.allTimeSpentEyebrow"),
      value: { kind: "amount", amount: data.totalExpenses },
    },
    {
      icon: Coins,
      eyebrow: t("recap.allTimeIncomeEyebrow"),
      value: { kind: "amount", amount: data.totalIncome },
    },
    {
      icon: netBalance >= 0n ? PiggyBank : TrendingDown,
      eyebrow: netBalance >= 0n ? t("recap.netBalanceEyebrowPositive") : t("recap.netBalanceEyebrowNegative"),
      value: { kind: "amount", amount: abs(netBalance).toString() },
    },
  ];

  if (data.topCategory) {
    drafts.push({
      icon: Crown,
      eyebrow: t("recap.topCategoryEyebrow"),
      value: { kind: "text", text: data.topCategory.name, dotColor: data.topCategory.color },
      caption: t("recap.topCategoryAllTimeCaption", { pct: data.topCategory.percentOfTotal.toFixed(0) }),
    });
  }

  if (data.biggestExpense) {
    drafts.push({
      icon: Flame,
      eyebrow: t("recap.biggestExpenseEyebrow"),
      value: { kind: "amount", amount: data.biggestExpense.amount },
      caption: t("recap.biggestExpenseCaption", {
        category: data.biggestExpense.categoryName,
        date: dateLabel(data.biggestExpense.occurredAt, locale),
      }),
    });
  }

  if (data.busiestMonth) {
    drafts.push({
      icon: CalendarDays,
      eyebrow: t("recap.busiestMonthEyebrow"),
      value: { kind: "text", text: monthKeyLabel(data.busiestMonth.month, locale) },
      caption: format(data.busiestMonth.total),
    });
  }

  drafts.push({
    icon: Receipt,
    eyebrow: t("recap.transactionsEyebrow"),
    value: { kind: "count", count: data.transactionCount },
    caption: t("recap.transactionsCaption", { months: data.monthsActive }),
  });

  if (data.topPaymentMethod) {
    drafts.push({
      icon: CreditCard,
      eyebrow: t("recap.topPaymentEyebrow"),
      value: { kind: "text", text: translatePaymentMethod(data.topPaymentMethod, language) },
    });
  }

  drafts.push({
    icon: PartyPopper,
    eyebrow: t("recap.allTimeOutroEyebrow"),
    value: { kind: "text", text: t("recap.allTimeCardTitle") },
    caption: t("recap.allTimeOutroCaption"),
    summary: [
      { label: t("recap.summarySpent"), value: format(data.totalExpenses) },
      { label: t("recap.summaryIncome"), value: format(data.totalIncome) },
      {
        label: netBalance >= 0n ? t("recap.summaryNet") : t("recap.summaryOverspent"),
        value: format(abs(netBalance)),
      },
      { label: t("recap.summaryTransactions"), value: String(data.transactionCount) },
    ],
  });

  return withThemes(drafts);
}
