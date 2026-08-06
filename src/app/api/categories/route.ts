import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const categories = await prisma.category.findMany({
    where: type ? { type: type as "expense" | "income" } : undefined,
    orderBy: [{ isFallback: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, type, color } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (type !== "expense" && type !== "income") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!color || typeof color !== "string") {
    return NextResponse.json({ error: "Color is required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), type, color },
  });
  return NextResponse.json(category, { status: 201 });
}
