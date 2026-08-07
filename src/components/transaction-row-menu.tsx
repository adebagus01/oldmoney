"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function TransactionRowMenu({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!onEdit && !onDelete) return null;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-text-muted transition-colors hover:text-text-primary"
        aria-label={t("transaction.transactionActions")}
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <ul className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-surface-raised py-1 shadow-lg">
          {onEdit ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface"
              >
                <Pencil size={14} />
                {t("common.edit")}
              </button>
            </li>
          ) : null}
          {onDelete ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-negative transition-colors hover:bg-surface"
              >
                <Trash2 size={14} />
                {t("common.delete")}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
