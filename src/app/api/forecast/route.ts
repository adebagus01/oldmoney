import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function monthKeyOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    select: { type: true, amount: true, occurredAt: true },
  });

  const months = new Set<string>();
  let lifetimeIncome = 0n;
  let lifetimeExpenses = 0n;
  for (const tx of transactions) {
    months.add(monthKeyOf(new Date(tx.occurredAt)));
    if (tx.type === "income") lifetimeIncome += tx.amount;
    else lifetimeExpenses += tx.amount;
  }

  const monthsOfData = months.size;
  const currentBalance = lifetimeIncome - lifetimeExpenses;
  const avgMonthlyIncome = monthsOfData > 0 ? lifetimeIncome / BigInt(monthsOfData) : 0n;
  const avgMonthlyExpenses = monthsOfData > 0 ? lifetimeExpenses / BigInt(monthsOfData) : 0n;
  const avgMonthlySavings = monthsOfData > 0 ? currentBalance / BigInt(monthsOfData) : 0n;

  return NextResponse.json({
    currentBalance: currentBalance.toString(),
    avgMonthlyIncome: avgMonthlyIncome.toString(),
    avgMonthlyExpenses: avgMonthlyExpenses.toString(),
    avgMonthlySavings: avgMonthlySavings.toString(),
    monthsOfData,
  });
}
