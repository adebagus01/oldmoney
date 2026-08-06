export type CurrencyCode = "IDR" | "USD" | "EUR" | "SGD" | "MYR" | "JPY" | "GBP" | "AUD";

export type CurrencyDef = {
  code: CurrencyCode;
  label: string;
  // Approximate IDR value of one unit — a fixed reference rate for display
  // only, not a live feed. Every amount is still entered and stored in
  // Rupiah; switching currency never touches the underlying data, so
  // switching back to IDR always shows the exact original numbers.
  idrPerUnit: number;
};

export const CURRENCIES: CurrencyDef[] = [
  { code: "IDR", label: "Indonesian Rupiah", idrPerUnit: 1 },
  { code: "USD", label: "US Dollar", idrPerUnit: 15_800 },
  { code: "EUR", label: "Euro", idrPerUnit: 17_200 },
  { code: "SGD", label: "Singapore Dollar", idrPerUnit: 11_700 },
  { code: "MYR", label: "Malaysian Ringgit", idrPerUnit: 3_350 },
  { code: "JPY", label: "Japanese Yen", idrPerUnit: 105 },
  { code: "GBP", label: "British Pound", idrPerUnit: 20_000 },
  { code: "AUD", label: "Australian Dollar", idrPerUnit: 10_300 },
];

export function getCurrency(code: string): CurrencyDef {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatInCurrency(
  amountIdr: number | bigint | string,
  code: string
): string {
  const currency = getCurrency(code);
  const converted = Number(amountIdr) / currency.idrPerUnit;

  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency.code,
  };
  if (currency.code === "IDR") {
    options.maximumFractionDigits = 0;
    options.minimumFractionDigits = 0;
  }

  const locale = currency.code === "IDR" ? "id-ID" : "en-US";
  return new Intl.NumberFormat(locale, options).format(converted);
}
