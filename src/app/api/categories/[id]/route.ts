import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; color?: string } = {};

  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.color === "string" && body.color) {
    data.color = body.color;
  }

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (category.isFallback) {
    return NextResponse.json(
      { error: "The Uncategorised category can't be deleted" },
      { status: 400 }
    );
  }

  let fallback = await prisma.category.findFirst({
    where: { type: category.type, isFallback: true },
  });
  if (!fallback) {
    // Normally seeded up front, but self-heal if it's missing (e.g. a
    // database that was never seeded) rather than blocking deletion.
    fallback = await prisma.category.create({
      data: {
        name: "Uncategorised",
        type: category.type,
        color: "#6b7280",
        isDefault: true,
        isFallback: true,
      },
    });
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: fallback.id },
    }),
    prisma.category.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
