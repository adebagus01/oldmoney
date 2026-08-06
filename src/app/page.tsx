"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { AmountInput } from "@/components/amount-input";
import { CategoryChips } from "@/components/category-chips";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { SectionLabel } from "@/components/section-label";
import { NoteField } from "@/components/note-field";
import { DateField } from "@/components/date-field";
import { TransactionList } from "@/components/transaction-list";
import { useToast } from "@/components/toast-provider";
import { useCurrency } from "@/components/currency-provider";
import type { PaymentMethod } from "@/lib/payment-methods";
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [date, setDate] = useState(todayIso());
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { format } = useCurrency();

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
    if (type === "income") setPaymentMethod(null);
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
          paymentMethod: type === "expense" ? paymentMethod : null,
          occurredAt: date,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save");
      }
      const savedAmount = amount;
      setAmount("");
      setNote("");
      setPaymentMethod(null);
      setDate(todayIso());
      await loadRecent();
      amountRef.current?.focus();
      const sign = type === "expense" ? "-" : "+";
      toast(
        `${type === "expense" ? "Expense" : "Income"} added: ${sign}${format(savedAmount)}`,
        { tone: type === "expense" ? "negative" : "positive" }
      );
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

        <div className="mt-6 mb-5">
          <NoteField
            value={note}
            onChange={setNote}
            placeholder={type === "expense" ? "What did you buy? (optional)" : "(optional)"}
          />
        </div>

        <div className="mb-5">
          <SectionLabel>Category</SectionLabel>
          <CategoryChips
            categories={categoriesForType}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </div>

        {type === "expense" ? (
          <div className="mb-5">
            <SectionLabel>Payment method</SectionLabel>
            <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>
        ) : null}

        <div className="mb-6">
          <DateField value={date} onChange={setDate} />
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
