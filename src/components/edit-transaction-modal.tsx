"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AmountInput } from "@/components/amount-input";
import { CategoryChips } from "@/components/category-chips";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { NoteField } from "@/components/note-field";
import { DateField } from "@/components/date-field";
import { SectionLabel } from "@/components/section-label";
import { isPaymentMethod, type PaymentMethod } from "@/lib/payment-methods";
import type { Category, Transaction } from "@/lib/types";

export function EditTransactionModal({
  transaction,
  onClose,
  onSaved,
}: {
  transaction: Transaction;
  onClose: () => void;
  onSaved: (updated: Transaction) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState(transaction.amount);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [note, setNote] = useState(transaction.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    isPaymentMethod(transaction.paymentMethod) ? transaction.paymentMethod : null
  );
  const [date, setDate] = useState(transaction.occurredAt.slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/categories?type=${transaction.type}`)
      .then((res) => res.json())
      .then(setCategories);
  }, [transaction.type]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          categoryId,
          note,
          paymentMethod: transaction.type === "expense" ? paymentMethod : null,
          occurredAt: date,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save");
      }
      const updated: Transaction = await res.json();
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Edit {transaction.type === "expense" ? "expense" : "income"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            positive={transaction.type === "income"}
          />

          <div className="mt-6 mb-5">
            <NoteField
              value={note}
              onChange={setNote}
              placeholder={
                transaction.type === "expense" ? "What did you buy? (optional)" : "(optional)"
              }
            />
          </div>

          <div className="mb-5">
            <SectionLabel>Category</SectionLabel>
            <CategoryChips
              categories={categories}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </div>

          {transaction.type === "expense" ? (
            <div className="mb-5">
              <SectionLabel>Payment method</SectionLabel>
              <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>
          ) : null}

          <div className="mb-6">
            <DateField value={date} onChange={setDate} />
          </div>

          {error ? <p className="mb-4 text-sm text-negative">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-3 text-sm font-semibold text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
