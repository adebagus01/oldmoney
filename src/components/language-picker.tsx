"use client";

import { clsx } from "clsx";
import { useLanguage } from "@/components/language-provider";

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={clsx(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          language === "en" ? "bg-surface-raised text-text-primary" : "text-text-muted"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={clsx(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          language === "id" ? "bg-surface-raised text-text-primary" : "text-text-muted"
        )}
      >
        ID
      </button>
    </div>
  );
}
