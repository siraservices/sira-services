// Parsers for QuickBooks Online report exports (CSV), used by the one-time
// migration into Sira Books. Pure functions: no Convex imports.
//
// - Chart of accounts: Reports > Account List (CSV). Needs an account name
//   column ("Account", "Full name" or "Name") and a "Type" column.
// - Transactions: Reports > Journal (CSV), all dates. Each transaction's
//   first row carries the date/type/num; following rows are its other lines.

import { AccountType, isIsoDate, toCents } from "./booksLib";

/** RFC 4180-ish CSV parser (quotes, escaped quotes, CRLF, BOM). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const norm = (h: string) => h.trim().toLowerCase().replace(/\s+/g, " ");

function findHeader(rows: string[][], required: string[][]): { index: number; cols: Record<string, number> } | null {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const cells = rows[i].map(norm);
    const cols: Record<string, number> = {};
    let ok = true;
    for (const options of required) {
      const idx = cells.findIndex((c) => options.includes(c));
      if (idx === -1) {
        ok = false;
        break;
      }
      cols[options[0]] = idx;
    }
    if (ok) {
      cells.forEach((c, idx) => {
        if (!(c in cols) && c) cols[c] = idx;
      });
      return { index: i, cols };
    }
  }
  return null;
}

/** QBO "MM/DD/YYYY" (or ISO) -> "YYYY-MM-DD"; null if not a date. */
export function qboDate(s: string): string | null {
  const t = s.trim();
  if (isIsoDate(t)) return t;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (!m) return null;
  const iso = `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  return isIsoDate(iso) ? iso : null;
}

export function mapQboType(qboType: string): AccountType | null {
  const t = norm(qboType);
  if (
    t === "bank" ||
    t.includes("accounts receivable") ||
    t.includes("current asset") ||
    t.includes("fixed asset") ||
    t === "other assets" ||
    t === "other asset"
  )
    return "asset";
  if (
    t.includes("accounts payable") ||
    t === "credit card" ||
    t.includes("liabilit")
  )
    return "liability";
  if (t === "equity") return "equity";
  if (t === "income" || t === "other income") return "income";
  if (t.includes("cost of goods") || t === "expenses" || t === "expense" || t === "other expense")
    return "expense";
  return null;
}

export type ImportedAccount = { name: string; type: AccountType; qboType: string; detailType?: string };

export function parseQboAccounts(text: string): { accounts: ImportedAccount[]; errors: string[] } {
  const rows = parseCsv(text);
  const header = findHeader(rows, [["account", "full name", "name"], ["type", "account type"]]);
  if (!header) return { accounts: [], errors: ["Couldn't find the Account and Type columns."] };
  const accounts: ImportedAccount[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of rows.slice(header.index + 1)) {
    const name = (r[header.cols["account"]] ?? "").trim();
    const qboType = (r[header.cols["type"]] ?? "").trim();
    if (!name || !qboType) continue;
    const type = mapQboType(qboType);
    if (!type) {
      errors.push(`Unknown QuickBooks type "${qboType}" for ${name}.`);
      continue;
    }
    if (seen.has(name)) continue;
    seen.add(name);
    const dIdx = header.cols["detail type"];
    accounts.push({ name, type, qboType, detailType: dIdx !== undefined ? r[dIdx]?.trim() || undefined : undefined });
  }
  return { accounts, errors };
}

export type ImportedLine = { accountName: string; debit: number; credit: number; name?: string; memo?: string };
export type ImportedEntry = {
  date: string;
  txnType: string;
  num?: string;
  memo?: string;
  lines: ImportedLine[];
  /** Stable key so re-running an import doesn't double-post. */
  sourceRef: string;
  error?: string;
};

export function parseQboJournal(text: string): { entries: ImportedEntry[]; errors: string[] } {
  const rows = parseCsv(text);
  const header = findHeader(rows, [["date", "transaction date"], ["account", "account name", "account full name"], ["debit"], ["credit"]]);
  if (!header) return { entries: [], errors: ["Couldn't find the Date, Account, Debit and Credit columns."] };
  const c = header.cols;
  const col = (r: string[], key: string) => (c[key] !== undefined ? (r[c[key]] ?? "").trim() : "");
  const entries: ImportedEntry[] = [];
  const errors: string[] = [];
  let current: ImportedEntry | null = null;
  const seq = new Map<string, number>();

  const close = () => {
    if (!current) return;
    const d = current.lines.reduce((s, l) => s + l.debit, 0);
    const cr = current.lines.reduce((s, l) => s + l.credit, 0);
    if (current.lines.length < 2) current.error = "Fewer than two lines.";
    else if (d !== cr) current.error = `Doesn't balance (debits ${d / 100} vs credits ${cr / 100}).`;
    const base = `qbo:${current.date}|${current.txnType}|${current.num ?? ""}|${d}`;
    const n = (seq.get(base) ?? 0) + 1;
    seq.set(base, n);
    current.sourceRef = `${base}|${n}`;
    entries.push(current);
    current = null;
  };

  for (const r of rows.slice(header.index + 1)) {
    const first = (r.find((x) => x.trim() !== "") ?? "").trim().toLowerCase();
    if (!first || first.startsWith("total")) {
      close();
      continue;
    }
    const rawDate = col(r, "date");
    const account = col(r, "account");
    const debit = toCents(col(r, "debit") || "0");
    const credit = toCents(col(r, "credit") || "0");
    if (rawDate) {
      const date = qboDate(rawDate);
      if (!date) continue; // report title rows, footers ("Accrual basis ...")
      close();
      current = {
        date,
        txnType: col(r, "transaction type") || "Journal",
        num: col(r, "num") || col(r, "no.") || undefined,
        memo: col(r, "memo/description") || col(r, "memo") || undefined,
        lines: [],
        sourceRef: "",
      };
    }
    if (!current || !account) continue;
    // A negative debit is really a credit, and vice versa (QBO does this
    // for some refunds). Net the line to a single side.
    const net = debit - credit;
    if (net === 0) continue;
    current.lines.push({
      accountName: account,
      debit: net > 0 ? net : 0,
      credit: net < 0 ? -net : 0,
      name: col(r, "name") || undefined,
      memo: col(r, "memo/description") || col(r, "memo") || undefined,
    });
  }
  close();
  for (const e of entries) if (e.error) errors.push(`${e.date} ${e.txnType} ${e.num ?? ""}: ${e.error}`);
  return { entries, errors };
}
