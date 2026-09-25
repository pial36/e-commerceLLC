import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Money is stored and passed around as integer CENTS. */
export function toCents(dollars: number | string): number {
  const num = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round((Number.isFinite(num) ? num : 0) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** Format a CENTS amount as USD. */
export function formatPrice(cents: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    ...opts,
  }).format((cents ?? 0) / 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human-readable order number, e.g. MRL-8F3K2Q */
export function genOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MRL-${rand}`;
}

/** Effective unit price: discount overrides base when set */
export function effectivePrice(price: number, discount?: number | null) {
  return discount && discount > 0 ? discount : price;
}
