"use client";

import { useState } from "react";
import type { Category, TransactionType } from "@/lib/types";

type ImportRow = {
  type: TransactionType;
  occurredAt: string;
  note: string;
  categoryName: string;
  paymentMethod: string | null;
  amount: number;
};

// Parsed from the user's July 2026 data export. "Pribadi" (a list/tag in the
// source app) is dropped; "Pemasukan" only marked type=income there and is
// not carried over — the real category follows it in that app's export.
const ROWS: ImportRow[] = [
  { type: "expense", occurredAt: "2026-07-31", note: "Hotel 1-3 agustus", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 518662 },
  { type: "expense", occurredAt: "2026-07-31", note: "makan /rs", categoryName: "Food", paymentMethod: "Cash", amount: 14000 },
  { type: "expense", occurredAt: "2026-07-30", note: "Service motor", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 284500 },
  { type: "expense", occurredAt: "2026-07-30", note: "Ban tubles", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 265000 },
  { type: "expense", occurredAt: "2026-07-29", note: "indomart", categoryName: "Shopping", paymentMethod: "Cash", amount: 25200 },
  { type: "expense", occurredAt: "2026-07-29", note: "Nasi goreng", categoryName: "Food", paymentMethod: "Cash", amount: 13000 },
  { type: "expense", occurredAt: "2026-07-29", note: "ayam potong 1kg + sisanya kasih adek", categoryName: "Shopping", paymentMethod: "Cash", amount: 50000 },
  { type: "expense", occurredAt: "2026-07-29", note: "Spiderman movie", categoryName: "Entertainment", paymentMethod: "Bank Transfer", amount: 31990 },
  { type: "expense", occurredAt: "2026-07-29", note: "Bensin", categoryName: "Transport", paymentMethod: "Cash", amount: 33000 },
  { type: "expense", occurredAt: "2026-07-29", note: "nasi bungkus", categoryName: "Food", paymentMethod: "Cash", amount: 18000 },
  { type: "expense", occurredAt: "2026-07-28", note: "Makan /rs", categoryName: "Food", paymentMethod: "Cash", amount: 13000 },
  { type: "expense", occurredAt: "2026-07-28", note: "Rujak", categoryName: "Food", paymentMethod: "Cash", amount: 15000 },
  { type: "expense", occurredAt: "2026-07-28", note: "Jajan idm", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 12400 },
  { type: "expense", occurredAt: "2026-07-27", note: "Charger axio", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 309030 },
  { type: "expense", occurredAt: "2026-07-27", note: "Kartu debit baru", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 25000 },
  { type: "expense", occurredAt: "2026-07-27", note: "Kopi", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 35000 },
  { type: "expense", occurredAt: "2026-07-26", note: "Long sleeve shirt", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 193603 },
  { type: "expense", occurredAt: "2026-07-26", note: "Nufsed pin", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 205000 },
  { type: "expense", occurredAt: "2026-07-26", note: "Duitlog subscribtion", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 15105 },
  { type: "expense", occurredAt: "2026-07-26", note: "Hutang", categoryName: "Debt", paymentMethod: "Bank Transfer", amount: 200000 },
  { type: "expense", occurredAt: "2026-07-25", note: "Claude subscribtion", categoryName: "Bills", paymentMethod: "E-Wallet", amount: 349000 },
  { type: "expense", occurredAt: "2026-07-25", note: "Sparepart motor", categoryName: "Bills", paymentMethod: "Cash", amount: 155000 },
  { type: "expense", occurredAt: "2026-07-25", note: "Service motor", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 40000 },
  { type: "expense", occurredAt: "2026-07-25", note: "Beras 5kg", categoryName: "Shopping", paymentMethod: "Cash", amount: 80000 },
  { type: "expense", occurredAt: "2026-07-25", note: "Admin tarik tunai", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 12000 },
  { type: "expense", occurredAt: "2026-07-25", note: "nasi bungkus", categoryName: "Food", paymentMethod: "Cash", amount: 13000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Dokter THT", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 150000 },
  { type: "expense", occurredAt: "2026-07-24", note: "timun", categoryName: "Shopping", paymentMethod: "Cash", amount: 6000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Sop", categoryName: "Shopping", paymentMethod: "Cash", amount: 10000 },
  { type: "expense", occurredAt: "2026-07-24", note: "gas LPG", categoryName: "Shopping", paymentMethod: "Cash", amount: 20000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Parkir", categoryName: "Transport", paymentMethod: "Cash", amount: 2000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Makan /rs", categoryName: "Food", paymentMethod: "Cash", amount: 13000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Bensin", categoryName: "Transport", paymentMethod: "Cash", amount: 18000 },
  { type: "expense", occurredAt: "2026-07-24", note: "Makanan alfa", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 18900 },
  { type: "expense", occurredAt: "2026-07-24", note: "admin atm", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 6000 },
  { type: "expense", occurredAt: "2026-07-22", note: "Sate", categoryName: "Food", paymentMethod: "Cash", amount: 20000 },
  { type: "expense", occurredAt: "2026-07-22", note: "Belanja idm", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 85100 },
  { type: "expense", occurredAt: "2026-07-22", note: "KI adek", categoryName: "Transport", paymentMethod: "Cash", amount: 350000 },
  { type: "expense", occurredAt: "2026-07-21", note: "Nasi&mie goreng", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 35000 },
  { type: "expense", occurredAt: "2026-07-21", note: "Kacang", categoryName: "Food", paymentMethod: "Cash", amount: 10000 },
  { type: "expense", occurredAt: "2026-07-21", note: "Rujak", categoryName: "Food", paymentMethod: "Cash", amount: 10000 },
  { type: "expense", occurredAt: "2026-07-20", note: "Icloud", categoryName: "Bills", paymentMethod: "E-Wallet", amount: 49000 },
  { type: "expense", occurredAt: "2026-07-20", note: "Dompet", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 107860 },
  { type: "expense", occurredAt: "2026-07-20", note: "Cardigan", categoryName: "Shopping", paymentMethod: "Bank Transfer", amount: 200700 },
  { type: "expense", occurredAt: "2026-07-20", note: "Tahu tek", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 14000 },
  { type: "expense", occurredAt: "2026-07-20", note: "Energen", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 29500 },
  { type: "expense", occurredAt: "2026-07-20", note: "Rujak", categoryName: "Food", paymentMethod: "Cash", amount: 10000 },
  { type: "expense", occurredAt: "2026-07-19", note: "Listrik", categoryName: "Bills", paymentMethod: "Bank Transfer", amount: 163930 },
  { type: "expense", occurredAt: "2026-07-19", note: "Nasi goreng", categoryName: "Food", paymentMethod: "Bank Transfer", amount: 54000 },
  { type: "expense", occurredAt: "2026-07-19", note: "Bensin", categoryName: "Transport", paymentMethod: "Cash", amount: 30000 },

  { type: "income", occurredAt: "2026-07-31", note: "Part time 20-26 july", categoryName: "Part Time", paymentMethod: null, amount: 1520062 },
  { type: "income", occurredAt: "2026-07-24", note: "Part time (13-19 july)", categoryName: "Part Time", paymentMethod: null, amount: 4661637 },
  { type: "income", occurredAt: "2026-07-17", note: "Part time 6-12 juli", categoryName: "Part Time", paymentMethod: null, amount: 5397000 },
  { type: "income", occurredAt: "2026-07-10", note: "Part time 29-5 juli", categoryName: "Part Time", paymentMethod: null, amount: 4992064 },
  { type: "income", occurredAt: "2026-07-03", note: "Part time 22-28 juni", categoryName: "Part Time", paymentMethod: null, amount: 3481328 },
  { type: "income", occurredAt: "2026-07-01", note: "Zerolab payment", categoryName: "Salary", paymentMethod: null, amount: 3500000 },
];

const NEW_CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ec4899",
  Debt: "#78350f",
  "Part Time": "#06b6d4",
};

type LogLine = { text: string; tone: "info" | "ok" | "error" };

export default function ImportJuly2026Page() {
  const [log, setLog] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function push(text: string, tone: LogLine["tone"] = "info") {
    setLog((l) => [...l, { text, tone }]);
  }

  async function runImport() {
    setRunning(true);
    setLog([]);
    let ok = 0;
    let failed = 0;

    try {
      push("Fetching existing categories…");
      const catRes = await fetch("/api/categories");
      const categories: Category[] = await catRes.json();

      const keyFor = (name: string, type: TransactionType) =>
        `${type}:${name.trim().toLowerCase()}`;
      const idByKey = new Map<string, string>();
      for (const c of categories) idByKey.set(keyFor(c.name, c.type), c.id);

      const needed = new Map<string, TransactionType>();
      for (const row of ROWS) {
        needed.set(row.categoryName, row.type);
      }

      for (const [name, type] of needed) {
        if (idByKey.has(keyFor(name, type))) continue;
        push(`Creating missing ${type} category "${name}"…`);
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            type,
            color: NEW_CATEGORY_COLORS[name] ?? "#6b7280",
          }),
        });
        if (!res.ok) {
          const body = await res.json();
          push(`Failed to create category "${name}": ${body.error}`, "error");
          continue;
        }
        const created: Category = await res.json();
        idByKey.set(keyFor(name, type), created.id);
        push(`Created category "${name}" (${created.id})`, "ok");
      }

      push(`Importing ${ROWS.length} transactions…`);
      for (const row of ROWS) {
        const categoryId = idByKey.get(keyFor(row.categoryName, row.type));
        if (!categoryId) {
          push(`Skipping "${row.note}" — no category id for ${row.categoryName}`, "error");
          failed++;
          continue;
        }
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: row.type,
            amount: row.amount,
            categoryId,
            note: row.note,
            paymentMethod: row.paymentMethod,
            occurredAt: row.occurredAt,
          }),
        });
        if (!res.ok) {
          const body = await res.json();
          push(`Failed: ${row.occurredAt} "${row.note}" — ${body.error}`, "error");
          failed++;
        } else {
          ok++;
        }
      }

      push(`Done. ${ok} imported, ${failed} failed.`, failed ? "error" : "ok");
      setDone(true);
    } catch (err) {
      push(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-6 md:py-10">
      <h1 className="mb-2 text-lg font-semibold text-text-primary">
        Import July 2026 data
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        One-time migration from a previous tracking app — {ROWS.length} transactions
        ({ROWS.filter((r) => r.type === "expense").length} expenses,{" "}
        {ROWS.filter((r) => r.type === "income").length} income). Creates the{" "}
        <strong>Entertainment</strong>, <strong>Debt</strong>, and{" "}
        <strong>Part Time</strong> categories if they don&apos;t already exist. Only
        run this once — running it again will duplicate every entry.
      </p>

      <button
        type="button"
        onClick={runImport}
        disabled={running || done}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-50"
      >
        {running ? "Importing…" : done ? "Import finished" : "Run import"}
      </button>

      {log.length > 0 ? (
        <div className="mt-6 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs">
          {log.map((line, i) => (
            <div
              key={i}
              className={
                line.tone === "error"
                  ? "text-negative"
                  : line.tone === "ok"
                    ? "text-positive"
                    : "text-text-muted"
              }
            >
              {line.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
