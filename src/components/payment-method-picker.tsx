"use client";

import { clsx } from "clsx";
import { Banknote, CreditCard, Wallet, Landmark } from "lucide-react";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { useLanguage } from "@/components/language-provider";
import { translatePaymentMethod } from "@/lib/i18n";

const ICONS: Record<PaymentMethod, typeof Banknote> = {
  Cash: Banknote,
  "Debit Card": CreditCard,
  "E-Wallet": Wallet,
  "Bank Transfer": Landmark,
};

export function PaymentMethodPicker({
  selected,
  onSelect,
}: {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  const { language } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = ICONS[method];
        const active = method === selected;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
              active
                ? "border-accent bg-accent/10 text-text-primary"
                : "border-border text-text-muted hover:text-text-primary"
            )}
          >
            <Icon size={15} className="shrink-0" />
            <span className="truncate">{translatePaymentMethod(method, language)}</span>
          </button>
        );
      })}
    </div>
  );
}
