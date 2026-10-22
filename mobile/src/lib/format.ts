// Paise ko rupaye me dikhao: 8500 -> ₹85 (web/src/lib/format.ts jaisa hi)
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
