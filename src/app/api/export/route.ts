import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTransaction } from "@/lib/serialize";

function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") ?? "json";

  const transactions = await prisma.transaction.findMany({
    orderBy: { occurredAt: "desc" },
    include: { category: true },
  });
  const serialized = transactions.map(serializeTransaction);

  if (format === "csv") {
    const rows = serialized.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      category: t.category.name,
      note: t.note ?? "",
      occurredAt: t.occurredAt.toISOString().slice(0, 10),
      createdAt: t.createdAt.toISOString(),
    }));
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="oldmoney-export.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(serialized, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="oldmoney-export.json"`,
    },
  });
}
