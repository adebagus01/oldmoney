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
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const active = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={clsx(
              "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-transparent bg-surface-raised text-text-primary ring-2 ring-accent"
                : "border-border text-text-muted hover:text-text-primary"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
