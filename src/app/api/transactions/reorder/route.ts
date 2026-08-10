import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ids = body.ids;

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.transaction.update({
        where: { id },
        data: { sortOrder: BigInt(index) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
