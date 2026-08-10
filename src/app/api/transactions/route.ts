import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTransaction } from "@/lib/serialize";
import { isPaymentMethod } from "@/lib/payment-methods";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const type = params.get("type");
  const categoryId = params.get("categoryId");
  const from = params.get("from");
  const to = params.get("to");
  const sort = params.get("sort") ?? "date_desc";
  const limit = params.get("limit");

  const where: Prisma.TransactionWhereInput = {};
  if (type === "expense" || type === "income") where.type = type;
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

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [orderBy, { createdAt: "desc" }],
    include: { category: true },
    take: limit ? Number(limit) : undefined,
  });

  return NextResponse.json(transactions.map(serializeTransaction));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, amount, categoryId, note, occurredAt, paymentMethod } = body;

  if (type !== "expense" && type !== "income") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive whole number" },
      { status: 400 }
    );
  }

  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== type) {
    return NextResponse.json({ error: "Invalid category for type" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      amount: BigInt(amountNum),
      categoryId,
      note: typeof note === "string" && note.trim() ? note.trim() : null,
      paymentMethod: isPaymentMethod(paymentMethod) ? paymentMethod : null,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      // Negative creation-time millis so it naturally sorts to the top of
      // "Custom order" (see schema.prisma) without disturbing any manual
      // reordering already applied to older transactions.
      sortOrder: BigInt(-Date.now()),
    },
    include: { category: true },
  });

  return NextResponse.json(serializeTransaction(transaction), { status: 201 });
}
