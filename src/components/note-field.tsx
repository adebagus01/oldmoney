"use client";

import { SectionLabel } from "@/components/section-label";

export function NoteField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <SectionLabel>Note</SectionLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-text-primary placeholder:text-text-muted outline-none focus:border-accent md:text-sm"
      />
    </div>
  );
}
