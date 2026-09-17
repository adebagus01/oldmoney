import { monthKeyLabel, shiftMonthKey } from "@/lib/money";
import { translatePaymentMethod, type Language, type TranslationKey } from "@/lib/i18n";
import type { AllTimeRecap, MonthlyRecap } from "@/lib/types";
import type { RecapSlide } from "@/components/recap-story-viewer";

const PALETTE = [
  "#4C1D95",
  "#0F766E",
  "#9F1239",
  "#92400E",
  "#1E3A8A",
  "#6D28D9",
  "#065F46",
  "#9A3412",
];

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;
type Format = (amount: number | bigint | string) => string;

function dateLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function Slide({
  eyebrow,
  value,
  caption,
}: {
  eyebrow: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-white">
      <div className="text-sm font-semibold tracking-wide text-white/70 uppercase">{eyebrow}</div>
      <div className="text-4xl leading-tight font-extrabold text-balance">{value}</div>
      {caption ? <div className="text-base text-white/80">{caption}</div> : null}
    </div>
  );
}

function CategoryDot({ color }: { color: string }) {
  return <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: color }} />;
}

export function buildMonthlySlides(
  data: MonthlyRecap,
  t: Translate,
  format: Format,
  locale: string
): RecapSlide[] {
  const monthLabel = monthKeyLabel(data.month, locale);

  if (!data.hasData) {
    return [
      {
        background: PALETTE[0],
        content: (
          <Slide eyebrow={monthLabel} value={t("recap.noDataTitle")} caption={t("recap.noDataCaption")} />
        ),
      },
    ];
  }

  const prevMonthLabel = monthKeyLabel(shiftMonthKey(data.month, -1), locale);
  const netSaved = BigInt(data.netSaved);
  const slides: RecapSlide[] = [
    {
      background: PALETTE[0],
      content: <Slide eyebrow={t("recap.monthlyIntroEyebrow")} value={monthLabel} caption={t("recap.monthlyIntroCaption")} />,
    },
    {
      background: PALETTE[1],
      content: (
        <Slide
          eyebrow={t("recap.totalSpentEyebrow")}
          value={format(data.totalExpenses)}
          caption={
            data.expenseChangePct === null
              ? undefined
              : data.expenseChangePct > 0
                ? t("recap.totalSpentCaptionUp", { pct: data.expenseChangePct.toFixed(0), prevMonth: prevMonthLabel })
                : data.expenseChangePct < 0
                  ? t("recap.totalSpentCaptionDown", {
                      pct: Math.abs(data.expenseChangePct).toFixed(0),
                      prevMonth: prevMonthLabel,
                    })
                  : t("recap.totalSpentCaptionFlat", { prevMonth: prevMonthLabel })
          }
        />
      ),
    },
    {
      background: PALETTE[2],
      content: <Slide eyebrow={t("recap.totalIncomeEyebrow")} value={format(data.totalIncome)} />,
    },
    {
      background: PALETTE[3],
      content: (
        <Slide
          eyebrow={netSaved >= 0n ? t("recap.netSavedEyebrowPositive") : t("recap.netSavedEyebrowNegative")}
          value={format(netSaved < 0n ? -netSaved : netSaved)}
        />
      ),
    },
  ];

  if (data.topCategory) {
    slides.push({
      background: PALETTE[4],
      content: (
        <Slide
          eyebrow={t("recap.topCategoryEyebrow")}
          value={
            <span>
              <CategoryDot color={data.topCategory.color} /> {data.topCategory.name}
            </span>
          }
          caption={t("recap.topCategoryCaption", { pct: data.topCategory.percentOfTotal.toFixed(0) })}
        />
      ),
    });
  }

  if (data.biggestExpense) {
    slides.push({
      background: PALETTE[5],
      content: (
        <Slide
          eyebrow={t("recap.biggestExpenseEyebrow")}
          value={format(data.biggestExpense.amount)}
          caption={t("recap.biggestExpenseCaption", {
            category: data.biggestExpense.categoryName,
            date: dateLabel(data.biggestExpense.occurredAt, locale),
          })}
        />
      ),
    });
  }

  slides.push({
    background: PALETTE[6],
    content: (
      <Slide
        eyebrow={t("recap.activityEyebrow")}
        value={data.transactionCount}
        caption={t("recap.activityCaption", { days: data.daysWithSpending })}
      />
    ),
  });

  slides.push({
    background: PALETTE[7],
    content: (
      <Slide eyebrow={t("recap.avgDailyEyebrow")} value={format(data.avgDailySpend)} caption={t("recap.avgDailyCaption")} />
    ),
  });

  slides.push({
    background: PALETTE[0],
    content: <Slide eyebrow={t("recap.monthlyOutroEyebrow")} value={monthLabel} caption={t("recap.monthlyOutroCaption")} />,
  });

  return slides;
}

export function buildAllTimeSlides(
  data: AllTimeRecap,
  t: Translate,
  format: Format,
  locale: string,
  language: Language
): RecapSlide[] {
  if (!data.hasData) {
    return [
      {
        background: PALETTE[0],
        content: <Slide eyebrow={t("recap.allTimeCardTitle")} value={t("recap.noDataTitle")} caption={t("recap.noDataCaption")} />,
      },
    ];
  }

  const netBalance = BigInt(data.netBalance);
  const slides: RecapSlide[] = [
    {
      background: PALETTE[0],
      content: (
        <Slide
          eyebrow={t("recap.allTimeIntroEyebrow")}
          value={t("recap.allTimeCardTitle")}
          caption={t("recap.allTimeIntroCaption", { date: dateLabel(data.firstTransactionDate, locale) })}
        />
      ),
    },
    {
      background: PALETTE[1],
      content: <Slide eyebrow={t("recap.allTimeSpentEyebrow")} value={format(data.totalExpenses)} />,
    },
    {
      background: PALETTE[2],
      content: <Slide eyebrow={t("recap.allTimeIncomeEyebrow")} value={format(data.totalIncome)} />,
    },
    {
      background: PALETTE[3],
      content: (
        <Slide
          eyebrow={netBalance >= 0n ? t("recap.netBalanceEyebrowPositive") : t("recap.netBalanceEyebrowNegative")}
          value={format(netBalance < 0n ? -netBalance : netBalance)}
        />
      ),
    },
  ];

  if (data.topCategory) {
    slides.push({
      background: PALETTE[4],
      content: (
        <Slide
          eyebrow={t("recap.topCategoryEyebrow")}
          value={
            <span>
              <CategoryDot color={data.topCategory.color} /> {data.topCategory.name}
            </span>
          }
          caption={t("recap.topCategoryAllTimeCaption", { pct: data.topCategory.percentOfTotal.toFixed(0) })}
        />
      ),
    });
  }

  if (data.biggestExpense) {
    slides.push({
      background: PALETTE[5],
      content: (
        <Slide
          eyebrow={t("recap.biggestExpenseEyebrow")}
          value={format(data.biggestExpense.amount)}
          caption={t("recap.biggestExpenseCaption", {
            category: data.biggestExpense.categoryName,
            date: dateLabel(data.biggestExpense.occurredAt, locale),
          })}
        />
      ),
    });
  }

  if (data.busiestMonth) {
    slides.push({
      background: PALETTE[6],
      content: (
        <Slide
          eyebrow={t("recap.busiestMonthEyebrow")}
          value={monthKeyLabel(data.busiestMonth.month, locale)}
          caption={format(data.busiestMonth.total)}
        />
      ),
    });
  }

  slides.push({
    background: PALETTE[7],
    content: (
      <Slide
        eyebrow={t("recap.transactionsEyebrow")}
        value={data.transactionCount}
        caption={t("recap.transactionsCaption", { months: data.monthsActive })}
      />
    ),
  });

  if (data.topPaymentMethod) {
    slides.push({
      background: PALETTE[1],
      content: (
        <Slide
          eyebrow={t("recap.topPaymentEyebrow")}
          value={translatePaymentMethod(data.topPaymentMethod, language)}
        />
      ),
    });
  }

  slides.push({
    background: PALETTE[0],
    content: <Slide eyebrow={t("recap.allTimeOutroEyebrow")} value={t("recap.allTimeCardTitle")} caption={t("recap.allTimeOutroCaption")} />,
  });

  return slides;
}

