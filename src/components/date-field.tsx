"use client";

import { Calendar } from "lucide-react";
import { SectionLabel } from "@/components/section-label";

export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <SectionLabel>Date</SectionLabel>
      <div className="relative w-full max-w-full overflow-hidden rounded-xl border border-border bg-surface">
        <Calendar
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full min-w-0 max-w-full appearance-none border-0 bg-transparent py-3.5 pl-11 pr-4 text-base text-text-primary outline-none focus:border-accent md:text-sm"
        />
      </div>
    </div>
  );
}
