// Pure double-entry helpers for Sira Books. No Convex imports, so the same
// code runs in Convex functions, in the browser, and in Jest.
//
// Money is always an integer number of cents. Never store floats.

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export const ACCOUNT_TYPES: AccountType[] = [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
];

export type LineInput = {
  accountId: string;
  debit: number; // cents
  credit: number; // cents
  memo?: string;
  contactId?: string;
};

/** Debit-normal accounts grow with debits; the rest grow with credits. */
export function isDebitNormal(type: AccountType): boolean {
  return type === "asset" || type === "expense";
}

/** Signed balance in the account's normal direction. */
export function normalBalance(type: AccountType, debit: number, credit: number): number {
  return isDebitNormal(type) ? debit - credit : credit - debit;
}

/** "12.34" | "1,234.5" | "(5.00)" | "-5" -> cents. Throws on junk. */
export function toCents(input: string | number): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) throw new Error(`Invalid amount: ${input}`);
    return Math.round(input * 100);
  }
  let s = input.trim().replace(/[$,\s]/g, "");
  if (s === "") return 0;
  let negative = false;
  if (s.startsWith("(") && s.endsWith(")")) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith("-")) {
    negative = !negative;
    s = s.slice(1);
  }
  if (!/^\d+(\.\d{0,2})?$/.test(s)) throw new Error(`Invalid amount: ${input}`);
  const [whole, frac = ""] = s.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return negative ? -cents : cents;
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Validate a journal entry's lines. Returns an error message or null. */
export function validateLines(lines: LineInput[]): string | null {
  if (lines.length < 2) return "An entry needs at least two lines.";
  let debits = 0;
  let credits = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!Number.isInteger(l.debit) || !Number.isInteger(l.credit)) {
      return `Line ${i + 1}: amounts must be whole cents.`;
    }
    if (l.debit < 0 || l.credit < 0) return `Line ${i + 1}: amounts can't be negative.`;
    if (l.debit > 0 && l.credit > 0) return `Line ${i + 1}: use either a debit or a credit, not both.`;
    if (l.debit === 0 && l.credit === 0) return `Line ${i + 1}: amount is zero.`;
    debits += l.debit;
    credits += l.credit;
  }
  if (debits !== credits) {
    return `Debits (${formatCents(debits)}) and credits (${formatCents(credits)}) don't balance.`;
  }
  return null;
}

/** Lines that undo an entry: swap debit and credit. */
export function reversalLines(lines: LineInput[]): LineInput[] {
  return lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit }));
}

export type AccountInfo = { id: string; name: string; type: AccountType; code?: string };
export type PostedLine = { accountId: string; debit: number; credit: number; date: string };

export type AccountTotal = AccountInfo & { debit: number; credit: number; balance: number };

/** Sum lines per account (lines should already be filtered to the period). */
export function totalsByAccount(accounts: AccountInfo[], lines: PostedLine[]): AccountTotal[] {
  const byId = new Map<string, AccountTotal>();
  for (const a of accounts) byId.set(a.id, { ...a, debit: 0, credit: 0, balance: 0 });
  for (const l of lines) {
    const t = byId.get(l.accountId);
    if (!t) continue;
    t.debit += l.debit;
    t.credit += l.credit;
  }
  const totals = Array.from(byId.values());
  for (const t of totals) t.balance = normalBalance(t.type, t.debit, t.credit);
  return totals.sort(
    (a, b) =>
      ACCOUNT_TYPES.indexOf(a.type) - ACCOUNT_TYPES.indexOf(b.type) ||
      (a.code ?? "").localeCompare(b.code ?? "") ||
      a.name.localeCompare(b.name),
  );
}

export type TrialBalance = { rows: AccountTotal[]; debit: number; credit: number };

export function trialBalance(accounts: AccountInfo[], lines: PostedLine[]): TrialBalance {
  const rows = totalsByAccount(accounts, lines).filter((r) => r.debit !== 0 || r.credit !== 0);
  let debit = 0;
  let credit = 0;
  for (const r of rows) {
    const net = r.debit - r.credit;
    if (net > 0) debit += net;
    else credit -= net;
  }
  return { rows, debit, credit };
}

export type ProfitAndLoss = {
  income: AccountTotal[];
  expenses: AccountTotal[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
};

export function profitAndLoss(accounts: AccountInfo[], lines: PostedLine[]): ProfitAndLoss {
  const rows = totalsByAccount(accounts, lines).filter((r) => r.balance !== 0);
  const income = rows.filter((r) => r.type === "income");
  const expenses = rows.filter((r) => r.type === "expense");
  const totalIncome = income.reduce((s, r) => s + r.balance, 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.balance, 0);
  return { income, expenses, totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses };
}

export type BalanceSheet = {
  assets: AccountTotal[];
  liabilities: AccountTotal[];
  equity: AccountTotal[];
  totalAssets: number;
  totalLiabilities: number;
  /** Equity accounts plus all net income to date (retained earnings). */
  totalEquity: number;
  netIncomeToDate: number;
  balanced: boolean;
};

/** Pass every line up to and including the as-of date. */
export function balanceSheet(accounts: AccountInfo[], lines: PostedLine[]): BalanceSheet {
  const rows = totalsByAccount(accounts, lines).filter((r) => r.balance !== 0);
  const assets = rows.filter((r) => r.type === "asset");
  const liabilities = rows.filter((r) => r.type === "liability");
  const equity = rows.filter((r) => r.type === "equity");
  const pl = profitAndLoss(accounts, lines);
  const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + r.balance, 0);
  const totalEquity = equity.reduce((s, r) => s + r.balance, 0) + pl.netIncome;
  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    netIncomeToDate: pl.netIncome,
    balanced: totalAssets === totalLiabilities + totalEquity,
  };
}

/** Normalise an email for comparisons. */
export function normEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** The only person who can open Sira Books unless he invites someone. */
export const BOOKS_OWNER_EMAIL = "aira4development@gmail.com";

export type MemberRow = { email: string; active: boolean; userId?: string };

/**
 * Decide what to do when a WorkOS user (with an email WorkOS says is
 * verified) asks for Books access. `row` is the booksMembers row for that
 * email, if any. Default is deny.
 */
export function decideBind(
  row: MemberRow | null,
  verifiedEmail: string,
  userId: string,
): "create-owner" | "bind" | "already" | "deny" {
  const e = normEmail(verifiedEmail);
  if (!row) return e === BOOKS_OWNER_EMAIL ? "create-owner" : "deny";
  if (!row.active) return "deny";
  if (row.userId === userId) return "already";
  if (row.userId) return "deny"; // email bound to a different account
  return "bind";
}

// ── CSV export ─────────────────────────────────────────────────────────────

/** Cents → "1234.56" (no $ or commas, for spreadsheets). */
export function centsToPlain(cents: number): string {
  const neg = cents < 0;
  const a = Math.abs(Math.round(cents));
  return `${neg ? "-" : ""}${Math.floor(a / 100)}.${String(a % 100).padStart(2, "0")}`;
}

/** RFC 4180 CSV. Cells that look like formulas are prefixed so Excel won't run them. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
