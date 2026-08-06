export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="h-3 w-[3px] rounded-full bg-accent" aria-hidden />
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {children}
      </span>
    </div>
  );
}
