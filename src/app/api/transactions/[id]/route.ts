import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTransaction } from "@/lib/serialize";
import { isPaymentMethod } from "@/lib/payment-methods";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: {
    amount?: bigint;
    note?: string | null;
    paymentMethod?: string | null;
    occurredAt?: Date;
    categoryId?: string;
  } = {};

  if (body.amount !== undefined) {
    const amountNum = Number(body.amount);
    if (!Number.isFinite(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive whole number" },
        { status: 400 }
      );
    }
    data.amount = BigInt(amountNum);
  }
  if (typeof body.note === "string") data.note = body.note.trim() || null;
  if (body.paymentMethod !== undefined) {
    data.paymentMethod = isPaymentMethod(body.paymentMethod) ? body.paymentMethod : null;
  }
  if (body.occurredAt) data.occurredAt = new Date(body.occurredAt);
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId;

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
    include: { category: true },
  });

  return NextResponse.json(serializeTransaction(transaction));
}
