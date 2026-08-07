"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { ROWS } from "./data";

// Maps the source spreadsheet's Indonesian category names to this app's
// expense categories, creating any that don't exist yet.
const CATEGORY_MAP: Record<string, string> = {
  Tagihan: "Bills",
  Makanan: "Food",
  Belanja: "Shopping",
  Transportasi: "Transport",
  Hiburan: "Entertainment",
  hutang: "Debt",
  Sedekah: "Charity",
};

const NEW_CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ec4899",
  Debt: "#78350f",
  Charity: "#14b8a6",
};

type LogLine = { text: string; tone: "info" | "ok" | "error" };

export default function ImportJuneJuly2026Page() {
  const [log, setLog] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function push(text: string, tone: LogLine["tone"] = "info") {
    setLog((l) => [...l, { text, tone }]);
  }

  async function run() {
    setRunning(true);
    setLog([]);

    try {
      // 1. Delete every existing July 2026 expense transaction.
      push("Fetching existing July 2026 expenses…");
      const existingRes = await fetch(
        "/api/transactions?type=expense&from=2026-07-01&to=2026-08-01"
      );
      const existing: { id: string }[] = await existingRes.json();
      push(`Found ${existing.length} existing July expense(s) to remove.`);

      let deleted = 0;
      for (const t of existing) {
        const res = await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
        if (res.ok) deleted++;
      }
      push(`Deleted ${deleted}/${existing.length} existing July expenses.`, "ok");

      // 2. Ensure every needed category exists.
      push("Fetching expense categories…");
      const catRes = await fetch("/api/categories?type=expense");
      const categories: Category[] = await catRes.json();
      const idByName = new Map(
        categories.map((c) => [c.name.toLowerCase(), c.id])
      );

      const neededNames = new Set(Object.values(CATEGORY_MAP));
      for (const name of neededNames) {
        if (idByName.has(name.toLowerCase())) continue;
        push(`Creating missing expense category "${name}"…`);
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            type: "expense",
            color: NEW_CATEGORY_COLORS[name] ?? "#6b7280",
          }),
        });
        if (!res.ok) {
          const body = await res.json();
          push(`Failed to create category "${name}": ${body.error}`, "error");
          continue;
        }
        const created: Category = await res.json();
        idByName.set(name.toLowerCase(), created.id);
        push(`Created category "${name}"`, "ok");
      }

      // 3. Insert every row from the spreadsheet (June + July).
      push(`Importing ${ROWS.length} transactions…`);
      let ok = 0;
      let failed = 0;
      for (const row of ROWS) {
        const mappedName = CATEGORY_MAP[row.categoryName];
        const categoryId = mappedName ? idByName.get(mappedName.toLowerCase()) : undefined;
        if (!categoryId) {
          push(
            `Skipping "${row.note}" — no category id for "${row.categoryName}"`,
            "error"
          );
          failed++;
          continue;
        }
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "expense",
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

  const juneCount = ROWS.filter((r) => r.occurredAt.startsWith("2026-06")).length;
  const julyCount = ROWS.filter((r) => r.occurredAt.startsWith("2026-07")).length;

  return (
    <div className="mx-auto max-w-xl px-5 py-6 md:py-10">
      <h1 className="mb-2 text-lg font-semibold text-text-primary">
        Import June + replace July 2026
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        One-time migration from the &quot;Personal_MG.xlsx&quot; export. First deletes every
        existing July 2026 expense in the app, then imports {ROWS.length} expenses
        from the spreadsheet ({juneCount} June, {julyCount} July). Creates the{" "}
        <strong>Entertainment</strong>, <strong>Debt</strong>, and{" "}
        <strong>Charity</strong> categories if they don&apos;t already exist. Income
        is untouched. Only run this once.
      </p>

      <button
        type="button"
        onClick={run}
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
