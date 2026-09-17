import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toMonthRange, currentMonthKey, shiftMonthKey } from "@/lib/money";
import type { AllTimeRecap, MonthlyRecap, CategoryStat, BiggestExpenseStat } from "@/lib/types";

function categoryStat(
  totals: Map<string, { name: string; color: string; total: bigint }>,
  grandTotal: bigint
): CategoryStat | null {
  const top = Array.from(totals.values()).sort((a, b) => (b.total > a.total ? 1 : -1))[0];
  if (!top) return null;
  return {
    name: top.name,
    color: top.color,
    total: top.total.toString(),
    percentOfTotal: grandTotal > 0n ? Number((top.total * 1000n) / grandTotal) / 10 : 0,
  };
}

function biggestExpenseStat(tx: {
  amount: bigint;
  note: string | null;
  occurredAt: Date;
  category: { name: string; color: string };
} | null): BiggestExpenseStat | null {
  if (!tx) return null;
  return {
    amount: tx.amount.toString(),
    categoryName: tx.category.name,
    categoryColor: tx.category.color,
    note: tx.note,
    occurredAt: tx.occurredAt.toISOString(),
  };
}

async function buildMonthlyRecap(month: string): Promise<MonthlyRecap> {
  const { start, end } = toMonthRange(month);
  const prevRange = toMonthRange(shiftMonthKey(month, -1));

  const [expenses, incomeAgg, prevExpenseAgg] = await Promise.all([
    prisma.transaction.findMany({
      where: { type: "expense", occurredAt: { gte: start, lt: end } },
      include: { category: true },
      orderBy: { amount: "desc" },
    }),
    prisma.transaction.aggregate({
      where: { type: "income", occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "expense", occurredAt: { gte: prevRange.start, lt: prevRange.end } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0n;
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0n);

  if (expenses.length === 0 && totalIncome === 0n) {
    return { hasData: false, month };
  }

  const prevMonthExpenses = prevExpenseAgg._sum.amount ?? 0n;
  const expenseChangePct =
    prevMonthExpenses > 0n
      ? (Number(totalExpenses - prevMonthExpenses) / Number(prevMonthExpenses)) * 100
      : null;

  const categoryTotals = new Map<string, { name: string; color: string; total: bigint }>();
  const daySet = new Set<string>();
  for (const tx of expenses) {
    daySet.add(tx.occurredAt.toISOString().slice(0, 10));
    const existing = categoryTotals.get(tx.categoryId);
    if (existing) existing.total += tx.amount;
    else categoryTotals.set(tx.categoryId, { name: tx.category.name, color: tx.category.color, total: tx.amount });
  }

  const isCurrentMonth = month === currentMonthKey();
  const today = new Date();
  const elapsedDays = isCurrentMonth
    ? today.getUTCDate()
    : Math.round((end.getTime() - start.getTime()) / 86400000);
  const avgDailySpend = elapsedDays > 0 ? totalExpenses / BigInt(elapsedDays) : 0n;

  return {
    hasData: true,
    month,
    totalExpenses: totalExpenses.toString(),
    totalIncome: totalIncome.toString(),
    netSaved: (totalIncome - totalExpenses).toString(),
    expenseChangePct,
    topCategory: categoryStat(categoryTotals, totalExpenses),
    biggestExpense: biggestExpenseStat(expenses[0] ?? null),
    transactionCount: expenses.length,
    avgDailySpend: avgDailySpend.toString(),
    daysWithSpending: daySet.size,
  };
}

async function buildAllTimeRecap(): Promise<AllTimeRecap> {
  const transactions = await prisma.transaction.findMany({
    include: { category: true },
    orderBy: { occurredAt: "asc" },
  });

  if (transactions.length === 0) {
    return { hasData: false };
  }

  let totalExpenses = 0n;
  let totalIncome = 0n;
  const categoryTotals = new Map<string, { name: string; color: string; total: bigint }>();
  const monthTotals = new Map<string, bigint>();
  const activeMonths = new Set<string>();
  const paymentMethodCounts = new Map<string, number>();
  const daySet = new Set<string>();
  let biggestExpense: (typeof transactions)[number] | null = null;

  for (const tx of transactions) {
    daySet.add(tx.occurredAt.toISOString().slice(0, 10));
    activeMonths.add(tx.occurredAt.toISOString().slice(0, 7));

    if (tx.type === "income") {
      totalIncome += tx.amount;
      continue;
    }

    totalExpenses += tx.amount;
    const existing = categoryTotals.get(tx.categoryId);
    if (existing) existing.total += tx.amount;
    else categoryTotals.set(tx.categoryId, { name: tx.category.name, color: tx.category.color, total: tx.amount });

    const monthKey = tx.occurredAt.toISOString().slice(0, 7);
    monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0n) + tx.amount);

    if (tx.paymentMethod) {
      paymentMethodCounts.set(tx.paymentMethod, (paymentMethodCounts.get(tx.paymentMethod) ?? 0) + 1);
    }

    if (!biggestExpense || tx.amount > biggestExpense.amount) biggestExpense = tx;
  }

  const busiestMonthEntry = Array.from(monthTotals.entries()).sort((a, b) => (b[1] > a[1] ? 1 : -1))[0];
  const topPaymentEntry = Array.from(paymentMethodCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    hasData: true,
    firstTransactionDate: transactions[0].occurredAt.toISOString(),
    totalExpenses: totalExpenses.toString(),
    totalIncome: totalIncome.toString(),
    netBalance: (totalIncome - totalExpenses).toString(),
    topCategory: categoryStat(categoryTotals, totalExpenses),
    biggestExpense: biggestExpenseStat(biggestExpense),
    busiestMonth: busiestMonthEntry ? { month: busiestMonthEntry[0], total: busiestMonthEntry[1].toString() } : null,
    transactionCount: transactions.length,
    monthsActive: activeMonths.size,
    daysTracked: daySet.size,
    topPaymentMethod: topPaymentEntry ? topPaymentEntry[0] : null,
  };
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");

  if (mode === "monthly") {
    const month = req.nextUrl.searchParams.get("month") ?? currentMonthKey();
    return NextResponse.json(await buildMonthlyRecap(month));
  }

  if (mode === "all-time") {
    return NextResponse.json(await buildAllTimeRecap());
  }

  return NextResponse.json({ error: "mode must be 'monthly' or 'all-time'" }, { status: 400 });
}
