export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumberIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount)
}

export function parseNumber(value: string): number {
  const cleaned = value.replace(/[Rp.,\s]/g, "")
  return parseFloat(cleaned) || 0
}
