/** US-style number formatting used everywhere in AbroadYield ($1,234.56). */

const usdCache = new Map<string, Intl.NumberFormat>();

function usdFormatter(decimals: number) {
  const key = `USD:${decimals}`;
  let formatter = usdCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    usdCache.set(key, formatter);
  }
  return formatter;
}

/** $1,234 (whole dollars) or $1,234.56 with `cents`. Negative values show as -$1,234. */
export function formatUsd(value: number, options: { cents?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = options.cents ? value : Math.round(value);
  return usdFormatter(options.cents ? 2 : 0).format(Object.is(rounded, -0) ? 0 : rounded);
}

/** Compact USD for chart axes: $12.3k, $1.2M. */
export function formatUsdCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Local currency in en-US conventions, e.g. €1,234 or MX$1,234. */
export function formatLocal(value: number, currency: string): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** 0.0425 → "4.3%" (or with the given decimals). */
export function formatPct(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPctRange([low, high]: [number, number], decimals = 1): string {
  if (low === high) return formatPct(low, decimals);
  return `${(low * 100).toFixed(decimals)}–${(high * 100).toFixed(decimals)}%`;
}

export function formatUsdRange(low: number, high: number): string {
  if (Math.round(low) === Math.round(high)) return formatUsd(low);
  return `${formatUsd(low)}–${formatUsd(high)}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
