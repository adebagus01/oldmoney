import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTransaction } from "@/lib/serialize";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const categoryId = params.get("categoryId");
  const from = params.get("from");
  const to = params.get("to");
  const sort = params.get("sort") ?? "date_desc";

  const where: Prisma.TransactionWhereInput = { type: "expense" };
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.occurredAt = {};
    if (from) where.occurredAt.gte = new Date(from);
    if (to) where.occurredAt.lt = new Date(to);
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput =
    sort === "date_asc"
      ? { occurredAt: "asc" }
      : sort === "amount_desc"
        ? { amount: "desc" }
        : sort === "amount_asc"
          ? { amount: "asc" }
          : { occurredAt: "desc" };

  const [transactions, breakdown] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [orderBy, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
    }),
  ]);

  const categories = await prisma.category.findMany({
    where: { id: { in: breakdown.map((b) => b.categoryId) } },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const total = transactions.reduce((sum, t) => sum + t.amount, 0n);

  return NextResponse.json({
    total: total.toString(),
    transactions: transactions.map(serializeTransaction),
    breakdown: breakdown
      .map((b) => ({
        category: categoryMap.get(b.categoryId),
        total: (b._sum.amount ?? 0n).toString(),
      }))
      .sort((a, b) => (BigInt(b.total) > BigInt(a.total) ? 1 : -1)),
  });
}
