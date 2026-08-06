"use client";

import { useMemo } from "react";
import { formatIDR } from "@/lib/money";

function dayLabel(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

function fullDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function DailyTrendChart({
  data,
}: {
  data: { date: string; total: string }[];
}) {
  const max = useMemo(
    () => Math.max(...data.map((d) => Number(d.total)), 1),
    [data]
  );

  const labelEvery = data.length > 20 ? 5 : data.length > 10 ? 3 : 1;

  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-muted">
        No days in range yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-32 items-end gap-[2px] border-b border-border">
        {data.map((d, i) => {
          const pct = Math.max((Number(d.total) / max) * 100, Number(d.total) > 0 ? 3 : 1);
          const tooltipAlign =
            i === 0 ? "left-0 translate-x-0" : i === data.length - 1 ? "right-0 left-auto translate-x-0" : "left-1/2 -translate-x-1/2";
          return (
            <div key={d.date} className="group relative flex h-full flex-1">
              <div
                tabIndex={0}
                aria-label={`${fullDateLabel(d.date)}: ${formatIDR(BigInt(d.total))}`}
                className="mt-auto w-full rounded-t-[4px] bg-negative/35 outline-none transition-colors hover:bg-negative focus:bg-negative"
                style={{ height: `${pct}%` }}
              />
              <div
                className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${tooltipAlign}`}
              >
                <div className="tabular-nums font-semibold text-text-primary">
                  {formatIDR(BigInt(d.total))}
                </div>
                <div className="text-text-muted">{fullDateLabel(d.date)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-[2px]">
        {data.map((d, i) => (
          <div
            key={d.date}
            className="flex-1 text-center text-[10px] text-text-muted"
          >
            {i === 0 || i === data.length - 1 || i % labelEvery === 0
              ? dayLabel(d.date)
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
