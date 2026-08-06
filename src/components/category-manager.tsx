"use client";

import { useEffect, useState } from "react";
import { Trash2, Check, X, Pencil } from "lucide-react";
import type { Category, TransactionType } from "@/lib/types";

const SWATCHES = [
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#22c55e",
  "#0ea5e9",
  "#84cc16",
  "#ec4899",
  "#f97316",
];

export function CategoryManager({ type }: { type: TransactionType }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(SWATCHES[0]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/categories?type=${type}`);
    setCategories(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    setEditingId(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Its transactions will move to Uncategorised.")) {
      return;
    }
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Failed to delete");
      return;
    }
    await load();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor, type }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Failed to add category");
      return;
    }
    setNewName("");
    await load();
  }

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-negative">{error}</p> : null}
      <ul className="mb-4 divide-y divide-border rounded-xl border border-border bg-surface">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
            {editingId === cat.id ? (
              <>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-full border-none bg-transparent"
                />
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => saveEdit(cat.id)}
                  className="rounded-md p-1.5 text-positive"
                  aria-label="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md p-1.5 text-text-muted"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm text-text-primary">
                  {cat.name}
                  {cat.isFallback ? (
                    <span className="ml-2 text-xs text-text-muted">(fallback)</span>
                  ) : null}
                </span>
                {!cat.isFallback ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="rounded-md p-1.5 text-text-muted hover:text-text-primary"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(cat.id)}
                      className="rounded-md p-1.5 text-text-muted hover:text-negative"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={addCategory} className="flex items-center gap-2">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-full border-none bg-transparent"
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`New ${type} category`}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground"
        >
          Add
        </button>
      </form>
    </div>
  );
}
