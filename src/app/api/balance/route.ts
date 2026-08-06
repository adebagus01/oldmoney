import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentMonthKey, toMonthRange } from "@/lib/money";

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

export async function GET(req: NextRequest) {
  const monthKey = req.nextUrl.searchParams.get("month") ?? currentMonthKey();
  const range = toMonthRange(monthKey);

  const [
    monthlyIncome,
    monthlyExpenses,
    lifetimeIncome,
    lifetimeExpenses,
    monthlyExpenseTx,
    categoryTotals,
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
  const dayCount = isCurrentMonth
    ? today.getUTCDate()
    : Math.round(
        (new Date(range.end).getTime() - new Date(range.start).getTime()) /
          86400000
      );

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
    categoryBreakdown,
    dailyExpenses,
  });
}
