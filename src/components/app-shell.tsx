"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Wallet, BarChart3, Calculator, Settings } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/components/language-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/", label: t("nav.add"), icon: PlusCircle },
    { href: "/balance", label: t("nav.balance"), icon: Wallet },
    { href: "/reports", label: t("nav.reports"), icon: BarChart3 },
    { href: "/calculator", label: t("nav.calculator"), icon: Calculator },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <nav className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:px-3 md:py-6">
        <div className="px-3 pb-8 text-lg font-semibold tracking-tight text-text-primary">
          {t("nav.appName")}
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-muted hover:bg-surface hover:text-text-primary"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-accent" : "text-text-muted"
              )}
            >
              <Icon size={22} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
