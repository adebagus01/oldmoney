"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useLanguage } from "@/components/language-provider";
import { translatePaymentMethod, localeFor } from "@/lib/i18n";
import { TransactionRowMenu } from "@/components/transaction-row-menu";
import type { Transaction } from "@/lib/types";

function dayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// Reinserts `draggingId` at `targetIndex` within `order`, treating `order`
// as the fixed pre-drag arrangement — never a previous drag's live output.
function reorderedWith(order: Transaction[], draggingId: string, targetIndex: number): Transaction[] {
  const originIndex = order.findIndex((tx) => tx.id === draggingId);
  if (originIndex === -1) return order;
  const next = [...order];
  const [moved] = next.splice(originIndex, 1);
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, moved);
  return next;
}

type DragState = {
  id: string;
  startClientY: number;
  // Vertical centers of every *other* row in this day group, measured once
  // at drag start — the target index is recomputed from these on every
  // move/up instead of accumulated incrementally, so bursty pointer events
  // can never compound into a corrupted order.
  otherCenters: { id: string; center: number }[];
};

function DayGroup({
  day,
  items,
  onEdit,
  onDelete,
  onReorder,
}: {
  day: string;
  items: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  onReorder?: (orderedIds: string[]) => void;
}) {
  const { format } = useCurrency();
  const { t, language } = useLanguage();
  const locale = localeFor(language);

  const [rowItems, setRowItems] = useState(items);
  useEffect(() => setRowItems(items), [items]);

  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const dragState = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // The pre-drag arrangement, frozen for the duration of the drag — kept in
  // state (not the dragState ref) because it's read during render to build
  // the live preview order.
  const [dragOriginalOrder, setDragOriginalOrder] = useState<Transaction[] | null>(null);
  const [dragY, setDragY] = useState(0);

  function computeTargetIndex(pointerY: number): number {
    const state = dragState.current;
    if (!state) return 0;
    let index = 0;
    for (const c of state.otherCenters) {
      if (pointerY > c.center) index++;
    }
    return index;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    e.preventDefault();
    const originalOrder = rowItems;
    const otherCenters = originalOrder
      .filter((tx) => tx.id !== id)
      .map((tx) => {
        const rect = rowRefs.current.get(tx.id)?.getBoundingClientRect();
        return { id: tx.id, center: rect ? rect.top + rect.height / 2 : 0 };
      });
    dragState.current = { id, startClientY: e.clientY, otherCenters };
    setDraggingId(id);
    setDragOriginalOrder(originalOrder);
    setDragY(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (!state) return;
    setDragY(e.clientY - state.startClientY);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (state && dragOriginalOrder) {
      const finalOrder = reorderedWith(dragOriginalOrder, state.id, computeTargetIndex(e.clientY));
      setRowItems(finalOrder);
      onReorder?.(finalOrder.map((tx) => tx.id));
    }
    dragState.current = null;
    setDraggingId(null);
    setDragOriginalOrder(null);
    setDragY(0);
  }

  // DOM order is deliberately frozen to `dragOriginalOrder` for the whole
  // drag (only the dragged row's transform moves) — reordering the actual
  // <li>/button DOM nodes mid-drag can silently drop pointer capture in
  // some browsers, which previously made some drags emit no events at all.
  // The real reorder is committed once, in handlePointerUp.
  const renderOrder = dragOriginalOrder ?? rowItems;
  const dayTotal = renderOrder.reduce((sum, tx) => sum + BigInt(tx.amount), 0n);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {dayLabel(day, locale)}
        </span>
        <span className="tabular-nums text-xs text-text-muted">{format(dayTotal)}</span>
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {renderOrder.map((tx) => (
          <li
            key={tx.id}
            ref={(el) => {
              if (el) rowRefs.current.set(tx.id, el);
              else rowRefs.current.delete(tx.id);
            }}
            className={`flex items-center gap-2 px-2 py-3 ${
              draggingId === tx.id ? "relative z-10 bg-surface-raised shadow-lg" : ""
            }`}
            style={draggingId === tx.id ? { transform: `translateY(${dragY}px)` } : undefined}
          >
            {onReorder ? (
              <button
                type="button"
                onPointerDown={(e) => handlePointerDown(e, tx.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="touch-none shrink-0 cursor-grab rounded-md p-1.5 text-text-muted active:cursor-grabbing"
                aria-label={t("reports.dragHint")}
              >
                <GripVertical size={16} />
              </button>
            ) : null}
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: tx.category.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-primary">
                {tx.category.name}
                {tx.paymentMethod ? (
                  <span className="font-normal text-text-muted">
                    {" "}
                    · {translatePaymentMethod(tx.paymentMethod, language)}
                  </span>
                ) : null}
              </div>
              {tx.note ? (
                <div className="truncate text-xs text-text-muted">{tx.note}</div>
              ) : null}
            </div>
            <div
              className={`tabular-nums shrink-0 text-sm font-semibold ${
                tx.type === "income" ? "text-positive" : "text-negative"
              }`}
            >
              {tx.type === "income" ? "+" : "-"}
              {format(tx.amount)}
            </div>
            <TransactionRowMenu
              onEdit={onEdit ? () => onEdit(tx) : undefined}
              onDelete={onDelete ? () => onDelete(tx) : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DailyGroupedTransactions({
  transactions,
  onEdit,
  onDelete,
  onReorder,
  emptyMessage,
}: {
  transactions: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  onReorder?: (orderedIds: string[]) => void;
  emptyMessage?: string;
}) {
  const { t } = useLanguage();
  const resolvedEmptyMessage = emptyMessage ?? t("add.noTransactionsYet");

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const day = tx.occurredAt.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(tx);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        {resolvedEmptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(([day, items]) => (
        <DayGroup
          key={day}
          day={day}
          items={items}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
