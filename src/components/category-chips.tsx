"use client";

import { clsx } from "clsx";
import type { Category } from "@/lib/types";

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((cat) => {
        const active = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
              active
                ? "border-accent bg-accent/10 text-text-primary"
                : "border-border text-text-muted hover:text-text-primary"
            )}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="truncate">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
