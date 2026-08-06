"use client";

import { useMemo, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";
import type { Transaction } from "@/lib/types";

const DELETE_UNDO_WINDOW_MS = 4000;

// Pending deletes are plain setTimeout calls, deliberately not tied to this
// hook's component lifecycle — a delete must still commit on its own even
// if the user navigates away before the undo window closes.
export function useDeleteWithUndo(transactions: Transaction[]) {
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { toast } = useToast();

  const visibleTransactions = useMemo(
    () => transactions.filter((t) => !pendingDeleteIds.has(t.id)),
    [transactions, pendingDeleteIds]
  );

  function requestDelete(target: Transaction) {
    setPendingDeleteIds((prev) => new Set(prev).add(target.id));

    const timer = setTimeout(async () => {
      timers.current.delete(target.id);
      await fetch(`/api/transactions/${target.id}`, { method: "DELETE" });
    }, DELETE_UNDO_WINDOW_MS);
    timers.current.set(target.id, timer);

    const label = target.note
      ? `${target.category.name} · ${target.note}`
      : target.category.name;

    toast(`Deleted "${label}"`, {
      actionLabel: "Undo",
      duration: DELETE_UNDO_WINDOW_MS,
      onAction: () => {
        const pendingTimer = timers.current.get(target.id);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          timers.current.delete(target.id);
        }
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(target.id);
          return next;
        });
      },
    });
  }

  function resetPendingDeletes() {
    setPendingDeleteIds(new Set());
  }

  return { visibleTransactions, requestDelete, resetPendingDeletes };
}
