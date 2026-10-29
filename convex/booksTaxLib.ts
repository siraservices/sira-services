// Pure tax helpers for a single-member LLC filing Schedule C. No Convex
// imports, so they run in Convex functions, the browser and Jest alike.
// These are planning numbers, not tax advice; the CPA files the return.

export type ScheduleCLine = { code: string; label: string; part: "income" | "expense" | "cogs" | "none" };

export const SCHEDULE_C_LINES: ScheduleCLine[] = [
  { code: "1", label: "Gross receipts or sales", part: "income" },
  { code: "2", label: "Returns and allowances", part: "income" },
  { code: "6", label: "Other income", part: "income" },
  { code: "4", label: "Cost of goods sold (Part III)", part: "cogs" },
  { code: "8", label: "Advertising", part: "expense" },
  { code: "9", label: "Car and truck expenses", part: "expense" },
  { code: "10", label: "Commissions and fees", part: "expense" },
  { code: "11", label: "Contract labor", part: "expense" },
  { code: "13", label: "Depreciation and section 179", part: "expense" },
  { code: "14", label: "Employee benefit programs", part: "expense" },
  { code: "15", label: "Insurance (other than health)", part: "expense" },
  { code: "16b", label: "Interest (other)", part: "expense" },
  { code: "17", label: "Legal and professional services", part: "expense" },
  { code: "18", label: "Office expense", part: "expense" },
  { code: "20a", label: "Rent or lease: vehicles, machinery, equipment", part: "expense" },
  { code: "20b", label: "Rent or lease: other business property", part: "expense" },
  { code: "21", label: "Repairs and maintenance", part: "expense" },
  { code: "22", label: "Supplies", part: "expense" },
  { code: "23", label: "Taxes and licenses", part: "expense" },
  { code: "24a", label: "Travel", part: "expense" },
  { code: "24b", label: "Deductible meals (50%)", part: "expense" },
  { code: "25", label: "Utilities", part: "expense" },
  { code: "26", label: "Wages", part: "expense" },
  { code: "27a", label: "Other expenses (Part V)", part: "expense" },
  { code: "30", label: "Business use of home (Form 8829)", part: "expense" },
  { code: "none", label: "Not on Schedule C", part: "none" },
];

const LINE = new Map(SCHEDULE_C_LINES.map((l) => [l.code, l]));
export const lineLabel = (code: string) => LINE.get(code)?.label ?? code;

/** Best guess at the Schedule C line for an account, from its name and type. */
export function guessScheduleCLine(name: string, type: string): string {
  const n = name.toLowerCase();
  const has = (...xs: string[]) => xs.some((x) => n.includes(x));
  if (type === "income") {
    if (has("refund", "discount")) return "2";
    if (has("other income", "interest earned", "rewards", "insurance claim", "sale of an asset")) return "6";
    return "1";
  }
  if (type !== "expense") return "none";
  if (has("cost of goods", "purchases")) return "4";
  if (has("advertising", "marketing")) return "8";
  if (has("vehicle", "parking", "tolls")) return "9";
  if (has("commission", "merchant account", "payments fees", "payment fees", "processing fee")) return "10";
  if (has("contract labor", "subcontractor")) return "11";
  if (has("depreciation")) return "13";
  if (has("employee benefit", "retirement plan", "worker's comp")) return "14";
  if (has("interest paid", "interest")) return "16b";
  if (has("insurance")) return "15";
  if (has("legal", "accounting")) return "17";
  if (has("home office")) return "30";
  if (has("equipment rental")) return "20a";
  if (has("rent")) return "20b";
  if (has("repair")) return "21";
  if (has("small tools")) return "22";
  if (has("office")) return "18"; // incl. office supplies, software, postage
  if (has("supplies")) return "22";
  if (has("taxes", "licen", "payroll expenses:taxes")) return "23";
  if (has("meals")) return "24b";
  if (has("travel", "airfare", "hotel", "taxi")) return "24a";
  if (has("utilities", "internet", "phone", "electric", "water")) return "25";
  if (has("wages", "payroll")) return "26";
  if (has("charit", "entertainment", "personal")) return "none";
  return "27a";
}

export type TaxAccount = { id: string; name: string; type: string; scheduleCLine?: string };
export type TaxLine = { accountId: string; debit: number; credit: number };

export type ScheduleCReport = {
  lines: { code: string; label: string; amount: number; accounts: { id: string; name: string; amount: number }[] }[];
  grossIncome: number; // line 7
  totalExpenses: number; // line 28
  netProfit: number; // line 31 (before home office, which is included here if mapped)
  mealsFull: number; // meals before the 50% limit
};

/** Totals by Schedule C line. Expense lines are positive; income lines positive for income. */
export function scheduleC(accounts: TaxAccount[], lines: TaxLine[], mileageCents = 0): ScheduleCReport {
  const acct = new Map(accounts.map((a) => [a.id, a]));
  const byAccount = new Map<string, number>();
  for (const l of lines) {
    const a = acct.get(l.accountId);
    if (!a || (a.type !== "income" && a.type !== "expense")) continue;
    const amt = a.type === "income" ? l.credit - l.debit : l.debit - l.credit;
    byAccount.set(a.id, (byAccount.get(a.id) ?? 0) + amt);
  }
  const groups = new Map<string, { id: string; name: string; amount: number }[]>();
  byAccount.forEach((amount, id) => {
    if (amount === 0) return;
    const a = acct.get(id)!;
    const code = a.scheduleCLine || guessScheduleCLine(a.name, a.type);
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code)!.push({ id, name: a.name, amount });
  });
  if (mileageCents) {
    if (!groups.has("9")) groups.set("9", []);
    groups.get("9")!.push({ id: "mileage", name: "Standard mileage (mileage log)", amount: mileageCents });
  }
  let mealsFull = 0;
  const out = SCHEDULE_C_LINES.filter((l) => groups.has(l.code)).map((l) => {
    const accts = groups.get(l.code)!.sort((a, b) => b.amount - a.amount);
    let amount = accts.reduce((s, a) => s + a.amount, 0);
    if (l.code === "24b") {
      mealsFull = amount;
      amount = Math.round(amount / 2);
    }
    if (l.code === "2") amount = -amount; // shown as a positive reduction of receipts
    return { code: l.code, label: l.label, amount, accounts: accts };
  });
  const get = (c: string) => out.find((l) => l.code === c)?.amount ?? 0;
  const grossIncome = get("1") - get("2") - get("4") + get("6");
  const totalExpenses = out.filter((l) => LINE.get(l.code)?.part === "expense").reduce((s, l) => s + l.amount, 0);
  return { lines: out, grossIncome, totalExpenses, netProfit: grossIncome - totalExpenses, mealsFull };
}

// ── Mileage ────────────────────────────────────────────────────────────────

/** IRS business standard mileage rate in tenths of a cent per mile (725 = 72.5¢). */
export function mileageRate(date: string): number {
  const y = Number(date.slice(0, 4));
  if (y <= 2022) return 585;
  if (y === 2023) return 655;
  if (y === 2024) return 670;
  if (y === 2025) return 700;
  if (y === 2026) return date >= "2026-07-01" ? 760 : 725; // Announcement 2026-11 raised it from July 1
  return 760; // update when the IRS sets the next year's rate
}

/** Deduction in cents for a trip. Miles may have one decimal. */
export function mileageDeduction(miles: number, date: string): number {
  return Math.round((miles * mileageRate(date)) / 10);
}

// ── Self-employment tax and estimates ─────────────────────────────────────

const WAGE_BASE: Record<number, number> = { 2023: 16020000, 2024: 16860000, 2025: 17610000, 2026: 18450000 };

/** Schedule SE estimate on net profit (cents). Ignores the 0.9% Additional Medicare Tax. */
export function selfEmploymentTax(netProfit: number, year: number) {
  if (netProfit <= 0) return { earnings: 0, socialSecurity: 0, medicare: 0, total: 0, deductibleHalf: 0 };
  const earnings = Math.round(netProfit * 0.9235);
  if (earnings < 40000) return { earnings, socialSecurity: 0, medicare: 0, total: 0, deductibleHalf: 0 }; // under $400
  const base = WAGE_BASE[year] ?? WAGE_BASE[2026];
  const socialSecurity = Math.round(Math.min(earnings, base) * 0.124);
  const medicare = Math.round(earnings * 0.029);
  const total = socialSecurity + medicare;
  return { earnings, socialSecurity, medicare, total, deductibleHalf: Math.round(total / 2) };
}

/** Federal estimated-tax due dates for a tax year (weekend/holiday shifts not applied). */
export function estimateDueDates(year: number): { quarter: string; due: string; covers: string }[] {
  return [
    { quarter: "Q1", due: `${year}-04-15`, covers: "Jan 1 – Mar 31" },
    { quarter: "Q2", due: `${year}-06-15`, covers: "Apr 1 – May 31" },
    { quarter: "Q3", due: `${year}-09-15`, covers: "Jun 1 – Aug 31" },
    { quarter: "Q4", due: `${year + 1}-01-15`, covers: "Sep 1 – Dec 31" },
  ];
}

// ── 1099s ──────────────────────────────────────────────────────────────────

/** 1099-NEC/MISC filing threshold in cents: $600 through 2025, $2,000 from 2026 (OBBBA). */
export function form1099Threshold(year: number): number {
  return year >= 2026 ? 200000 : 60000;
}
