// Ceil-divides (goal - current) by monthlyNet. Returns 0 if the goal is
// already met, or null if monthlyNet isn't positive (goal unreachable).
export function monthsToGoal(current: bigint, monthlyNet: bigint, goal: bigint): number | null {
  if (goal <= current) return 0;
  if (monthlyNet <= 0n) return null;
  const diff = goal - current;
  const months = (diff + monthlyNet - 1n) / monthlyNet;
  return Number(months);
}

export function addMonthsUTC(date: Date, months: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function monthYearLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
