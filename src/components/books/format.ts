export { formatCents, toCents } from "../../../convex/booksLib";

/** Today in the browser's time zone as YYYY-MM-DD. */
export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const TYPE_LABEL: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  income: "Income",
  expense: "Expenses",
};

export const card = "p-5 bg-surface-alt shadow-soft border border-surface-border rounded-xl";
export const input =
  "w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30";
export const btn =
  "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-display font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors cursor-pointer";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-sm text-text hover:bg-surface-hover disabled:opacity-50 transition-colors cursor-pointer";
