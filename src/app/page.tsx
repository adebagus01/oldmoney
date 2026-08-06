"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { AmountInput } from "@/components/amount-input";
import { CategoryChips } from "@/components/category-chips";
import { TransactionList } from "@/components/transaction-list";
import type { Category, Transaction, TransactionType } from "@/lib/types";

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddPage() {
  const [type, setType] = useState<TransactionType>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayIso());
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const categoriesForType = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data: Category[] = await res.json();
    setCategories(data);
  }

  async function loadRecent() {
    const res = await fetch("/api/transactions?limit=10");
    const data: Transaction[] = await res.json();
    setRecent(data);
  }

  useEffect(() => {
    loadCategories();
    loadRecent();
    amountRef.current?.focus();
  }, []);

  useEffect(() => {
    const forType = categories.filter((c) => c.type === type);
    if (forType.length > 0 && !forType.some((c) => c.id === categoryId)) {
      setCategoryId(forType.find((c) => !c.isFallback)?.id ?? forType[0].id);
    }
  }, [type, categories, categoryId]);

  useEffect(() => {
    amountRef.current?.focus();
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!categoryId) {
      setError("Pick a category.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          categoryId,
          note,
          occurredAt: date,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save");
      }
      setAmount("");
      setNote("");
      setDate(todayIso());
      await loadRecent();
      amountRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    await loadRecent();
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-6 md:py-10">
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              type === "expense"
                ? "bg-negative/15 text-negative"
                : "text-text-muted"
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              type === "income"
                ? "bg-positive/15 text-positive"
                : "text-text-muted"
            )}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AmountInput
          ref={amountRef}
          value={amount}
          onChange={setAmount}
          positive={type === "income"}
        />

        <div className="mb-5">
          <CategoryChips
            categories={categoriesForType}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error ? (
          <p className="mb-4 text-sm text-negative">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : `Save ${type === "expense" ? "expense" : "income"}`}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="mb-2 text-sm font-semibold text-text-muted">
          Recent
        </h2>
        <TransactionList transactions={recent} onDelete={handleDelete} />
      </div>
    </div>
  );
}
