"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { clsx } from "clsx";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-20 rounded-full bg-surface-raised" />;
  }

  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={clsx(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          theme === "dark" ? "bg-surface-raised text-text-primary" : "text-text-muted"
        )}
      >
        <Moon size={14} /> Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={clsx(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          theme === "light" ? "bg-surface-raised text-text-primary" : "text-text-muted"
        )}
      >
        <Sun size={14} /> Light
      </button>
    </div>
  );
}
