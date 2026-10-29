// Pure helpers for invoices, expenses and the bank feed. No Convex imports,
// so they run in Convex functions, the browser and Jest alike.
//
// Sign convention for bank and card transactions: amount is signed cents
// from the account's point of view as the bank shows it.
//   positive = money in  (deposit, card refund or payment)
//   negative = money out (withdrawal, card charge)
// That makes one posting rule work for both checking (an asset) and a
// credit card (a liability): money in debits the bank/card account.

import { parseCsv, qboDate } from "./booksImportLib";
import { toCents } from "./booksLib";

export type PostLine<Id = string> = { accountId: Id; debit: number; credit: number; memo?: string };

// ── Invoices ───────────────────────────────────────────────────────────────

export type InvoiceLineInput = { description: string; quantity: number; rate: number; accountId: string };

/** quantity can have decimals (e.g. 1.5 hours); rate is cents. */
export function lineAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate);
}

export function invoiceTotal(lines: { quantity: number; rate: number }[]): number {
  return lines.reduce((s, l) => s + lineAmount(l.quantity, l.rate), 0);
}

export function validateInvoiceLines(lines: InvoiceLineInput[]): string | null {
  if (lines.length === 0) return "Add at least one line.";
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.description.trim()) return `Line ${i + 1}: add a description.`;
    if (!(l.quantity > 0) || !Number.isFinite(l.quantity)) return `Line ${i + 1}: quantity must be above zero.`;
    if (!Number.isInteger(l.rate) || l.rate <= 0) return `Line ${i + 1}: rate must be above zero.`;
    if (lineAmount(l.quantity, l.rate) <= 0) return `Line ${i + 1}: the amount rounds to $0.00.`;
    if (!l.accountId) return `Line ${i + 1}: pick an income account.`;
  }
  return null;
}

/** Sending an invoice: A/R up, income up (one credit per income account). */
export function invoicePostingLines<Id extends string>(
  arAccountId: Id,
  lines: { description: string; quantity: number; rate: number; accountId: Id }[],
): PostLine<Id>[] {
  const byAccount = new Map<Id, number>();
  for (const l of lines) byAccount.set(l.accountId, (byAccount.get(l.accountId) ?? 0) + lineAmount(l.quantity, l.rate));
  const total = invoiceTotal(lines);
  const out: PostLine<Id>[] = [{ accountId: arAccountId, debit: total, credit: 0 }];
  byAccount.forEach((amount, accountId) => out.push({ accountId, debit: 0, credit: amount }));
  return out;
}

/** Customer pays: cash up, A/R down. Optional processor fee (e.g. Stripe). */
export function paymentPostingLines<Id extends string>(
  arAccountId: Id,
  depositAccountId: Id,
  amount: number,
  fee?: { accountId: Id; amount: number },
): PostLine<Id>[] {
  const feeAmt = fee && fee.amount > 0 ? fee.amount : 0;
  const out: PostLine<Id>[] = [{ accountId: depositAccountId, debit: amount - feeAmt, credit: 0 }];
  if (fee && feeAmt > 0) out.push({ accountId: fee.accountId, debit: feeAmt, credit: 0 });
  out.push({ accountId: arAccountId, debit: 0, credit: amount });
  return out;
}

export function invoiceStatusAfterPayment(total: number, paid: number): "sent" | "partial" | "paid" {
  if (paid >= total) return "paid";
  return paid > 0 ? "partial" : "sent";
}

/** Next invoice number after the highest numeric one so far (QBO used 1001+). */
export function nextInvoiceNumber(existing: string[]): string {
  let max = 1000;
  for (const n of existing) {
    const v = Number(n);
    if (Number.isInteger(v) && v > max && v < 100000) max = v;
  }
  return String(max + 1);
}

// ── Expenses and bank transactions ─────────────────────────────────────────

/**
 * Lines for money moving through a bank or card account.
 * amount > 0: money in  → Dr bank/card, Cr category (income, refund, transfer).
 * amount < 0: money out → Dr category,  Cr bank/card.
 */
export function cashPostingLines<Id extends string>(cashAccountId: Id, categoryAccountId: Id, amount: number, memo?: string): PostLine<Id>[] {
  if (!Number.isInteger(amount) || amount === 0) throw new Error("Amount must be a non-zero number of cents.");
  const a = Math.abs(amount);
  return amount > 0
    ? [
        { accountId: cashAccountId, debit: a, credit: 0, memo },
        { accountId: categoryAccountId, debit: 0, credit: a, memo },
      ]
    : [
        { accountId: categoryAccountId, debit: a, credit: 0, memo },
        { accountId: cashAccountId, debit: 0, credit: a, memo },
      ];
}

/** Signed amount a ledger line represents in a bank/card account. */
export function lineCashAmount(line: { debit: number; credit: number }): number {
  return line.debit - line.credit;
}

export type BankRow = { date: string; description: string; amount: number; hash: string };

export function normDesc(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function daysBetween(a: string, b: string): number {
  return Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000;
}

/**
 * Parse a bank or card CSV export. Understands Chase checking
 * (Details, Posting Date, Description, Amount, ...), Chase cards
 * (Transaction Date, Post Date, Description, Category, Type, Amount, Memo)
 * and generic files with a date, a description and either an amount column
 * or separate debit/credit columns.
 */
export function parseBankCsv(text: string): { rows: BankRow[]; errors: string[]; format: string } {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  const errors: string[] = [];
  const out: BankRow[] = [];
  if (rows.length === 0) return { rows: out, errors: ["The file is empty."], format: "unknown" };
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const find = (...names: string[]) => head.findIndex((h) => names.includes(h));
  const iDate = find("transaction date", "posting date", "date", "post date");
  const iDesc = find("description", "payee", "name", "memo");
  const iAmt = find("amount");
  const iDebit = find("debit", "withdrawal", "withdrawals");
  const iCredit = find("credit", "deposit", "deposits");
  if (iDate === -1 || iDesc === -1 || (iAmt === -1 && iDebit === -1 && iCredit === -1)) {
    return { rows: out, errors: ["Couldn't find date, description and amount columns."], format: "unknown" };
  }
  const format = head.includes("details") && head.includes("posting date")
    ? "Chase checking"
    : head.includes("post date") && head.includes("category")
      ? "Chase card"
      : "generic";

  const seen = new Map<string, number>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const date = qboDate(r[iDate] ?? "");
    const description = (r[iDesc] ?? "").trim();
    if (!date) {
      errors.push(`Row ${i + 1}: unreadable date "${r[iDate] ?? ""}".`);
      continue;
    }
    let amount: number;
    try {
      if (iAmt !== -1) amount = toCents(r[iAmt] ?? "");
      else {
        const d = iDebit !== -1 ? Math.abs(toCents(r[iDebit] ?? "")) : 0;
        const c = iCredit !== -1 ? Math.abs(toCents(r[iCredit] ?? "")) : 0;
        amount = c - d;
      }
    } catch {
      errors.push(`Row ${i + 1}: unreadable amount.`);
      continue;
    }
    if (amount === 0) continue;
    const base = `${date}|${amount}|${normDesc(description)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.push({ date, description, amount, hash: `${base}|${n}` });
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return { rows: out, errors, format };
}

export type Rule<Id = string> = { contains: string; accountId: Id; active: boolean };

/** Most specific active rule (longest "contains") whose text is in the description. */
export function matchRule<R extends { contains: string; active: boolean }>(description: string, rules: R[]): R | null {
  const d = normDesc(description);
  let best: R | null = null;
  for (const r of rules) {
    const c = normDesc(r.contains);
    if (!r.active || !c || !d.includes(c)) continue;
    if (!best || c.length > normDesc(best.contains).length) best = r;
  }
  return best;
}

export type LedgerCandidate = { entryId: string; date: string; amount: number; memo?: string };

/**
 * Ledger lines in the same account that look like this bank row: same signed
 * amount within `days` days, not already matched. Closest date first.
 */
export function findMatches(
  row: { date: string; amount: number },
  candidates: LedgerCandidate[],
  alreadyMatched: Set<string>,
  days = 5,
): LedgerCandidate[] {
  return candidates
    .filter((c) => c.amount === row.amount && !alreadyMatched.has(c.entryId) && daysBetween(c.date, row.date) <= days)
    .sort((a, b) => daysBetween(a.date, row.date) - daysBetween(b.date, row.date));
}

// ── Recurring invoices ─────────────────────────────────────────────────────

/** The given day of a month, clamped to the month's last day (31 → Feb 28/29). */
export function dayInMonth(year: number, month0: number, day: number): string {
  const last = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month0, Math.min(day, last))).toISOString().slice(0, 10);
}

/** Next issue date after `date` for a schedule that repeats every N months on `dayOfMonth`. */
export function nextRecurringDate(date: string, everyMonths: number, dayOfMonth: number): string {
  const [y, m] = date.split("-").map(Number);
  const total = y * 12 + (m - 1) + everyMonths;
  return dayInMonth(Math.floor(total / 12), total % 12, dayOfMonth);
}

export function addDaysIso(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

/** Suggested first date for a new schedule: this month's day if still ahead, else next month's. */
export function firstRecurringDate(today: string, dayOfMonth: number): string {
  const [y, m] = today.split("-").map(Number);
  const thisMonth = dayInMonth(y, m - 1, dayOfMonth);
  return thisMonth >= today ? thisMonth : nextRecurringDate(thisMonth, 1, dayOfMonth);
}

/** Move a schedule's next date forward to the first date on or after `today`. */
export function rollForward(nextDate: string, today: string, everyMonths: number, dayOfMonth: number): string {
  let d = nextDate;
  for (let i = 0; i < 1200 && d < today; i++) d = nextRecurringDate(d, everyMonths, dayOfMonth);
  return d;
}
