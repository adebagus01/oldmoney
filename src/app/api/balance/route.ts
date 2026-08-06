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

export async function GET(req: NextRequest) {
  const monthKey = req.nextUrl.searchParams.get("month") ?? currentMonthKey();
  const range = toMonthRange(monthKey);

  const [monthlyIncome, monthlyExpenses, lifetimeIncome, lifetimeExpenses] =
    await Promise.all([
      sumByType("income", range),
      sumByType("expense", range),
      sumByType("income"),
      sumByType("expense"),
    ]);

  const monthlyRemaining = monthlyIncome - monthlyExpenses;
  const lifetimeNet = lifetimeIncome - lifetimeExpenses;

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
  });
}
