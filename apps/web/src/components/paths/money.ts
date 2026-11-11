/** "UGX 1.3M" style figure; falls back to a plain number when the currency is unknown. */
export function money(value: number, currency: string | null, compact = true): string {
  try {
    return new Intl.NumberFormat("en", { style: currency ? "currency" : "decimal", currency: currency ?? undefined, notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 0, currencyDisplay: "code" })
      .format(value).replace(/ /g, " ");
  } catch {
    return `${currency ?? ""} ${Math.round(value).toLocaleString("en")}`.trim();
  }
}
