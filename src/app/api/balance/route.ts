import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentMonthKey, shiftMonthKey, toMonthRange } from "@/lib/money";

async function sumByType(
  type: "expense" | "income",
  range?: { start: Date; end: Date }
) {
  const result = await prisma.transaction.aggregate({
    where: {
      type,
      ...(range ? { occurredAt: { gte: range.start, lt: range.end } } : {}),
    },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0n;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysInRange(range: { start: Date; end: Date }): number {
  return Math.round((range.end.getTime() - range.start.getTime()) / 86400000);
}

export async function GET(req: NextRequest) {
  const monthKey = req.nextUrl.searchParams.get("month") ?? currentMonthKey();
  const range = toMonthRange(monthKey);
  const prevMonthKey = shiftMonthKey(monthKey, -1);
  const prevRange = toMonthRange(prevMonthKey);

  const [
    monthlyIncome,
    monthlyExpenses,
    lifetimeIncome,
    lifetimeExpenses,
    monthlyExpenseTx,
    categoryTotals,
    prevMonthlyExpenses,
  ] = await Promise.all([
    sumByType("income", range),
    sumByType("expense", range),
    sumByType("income"),
    sumByType("expense"),
    prisma.transaction.findMany({
      where: {
        type: "expense",
        occurredAt: { gte: range.start, lt: range.end },
      },
      select: { amount: true, occurredAt: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        type: "expense",
        occurredAt: { gte: range.start, lt: range.end },
      },
      _sum: { amount: true },
    }),
    sumByType("expense", prevRange),
  ]);

  const monthlyRemaining = monthlyIncome - monthlyExpenses;
  const lifetimeNet = lifetimeIncome - lifetimeExpenses;

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryTotals.map((c) => c.categoryId) } },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const categoryBreakdown = categoryTotals
    .map((c) => ({
      category: categoryMap.get(c.categoryId),
      total: (c._sum.amount ?? 0n).toString(),
    }))
    .sort((a, b) => (BigInt(b.total) > BigInt(a.total) ? 1 : -1));

  // Zero-filled daily series, capped at today for the current month.
  const today = new Date();
  const isCurrentMonth = monthKey === currentMonthKey();
  const dayCount = isCurrentMonth ? today.getUTCDate() : daysInRange(range);

  const dailyTotals = new Map<string, bigint>();
  for (const tx of monthlyExpenseTx) {
    const key = dateKey(new Date(tx.occurredAt));
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0n) + tx.amount);
  }

  const dailyExpenses = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(range.start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dateKey(d);
    return { date: key, total: (dailyTotals.get(key) ?? 0n).toString() };
  });

  // Average daily spend for the selected month vs. the previous one — the
  // previous month is always fully elapsed, so it uses its full day count.
  const prevDayCount = daysInRange(prevRange);
  const avgDaily = dayCount > 0 ? monthlyExpenses / BigInt(dayCount) : 0n;

  // Change vs. last month is based on *total* expenses, not the daily
  // average, plus the raw gap between the two totals.
  const expenseGap = monthlyExpenses - prevMonthlyExpenses;
  const changePct =
    prevMonthlyExpenses > 0n
      ? (Number(expenseGap) / Number(prevMonthlyExpenses)) * 100
      : null;

  return NextResponse.json({
    month: monthKey,
    monthly: {
      income: monthlyIncome.toString(),
      expenses: monthlyExpenses.toString(),
      remaining: monthlyRemaining.toString(),
    },
    lifetime: {
      income: lifetimeIncome.toString(),
      expenses: lifetimeExpenses.toString(),
      net: lifetimeNet.toString(),
    },
    averageDailySpend: {
      current: avgDaily.toString(),
      previous:
        prevDayCount > 0
          ? (prevMonthlyExpenses / BigInt(prevDayCount)).toString()
          : "0",
      changePct,
      expenseGap: expenseGap.toString(),
      previousMonthExpenses: prevMonthlyExpenses.toString(),
    },
    categoryBreakdown,
    dailyExpenses,
  });
}
