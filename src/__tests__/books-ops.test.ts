import { balanceSheet, profitAndLoss, validateLines, type AccountInfo, type PostedLine } from "../../convex/booksLib";
import {
  cashPostingLines,
  findMatches,
  invoicePostingLines,
  invoiceStatusAfterPayment,
  invoiceTotal,
  lineAmount,
  matchRule,
  nextInvoiceNumber,
  parseBankCsv,
  paymentPostingLines,
  validateInvoiceLines,
} from "../../convex/booksOpsLib";

const accounts: AccountInfo[] = [
  { id: "chk", name: "Checking", type: "asset" },
  { id: "ar", name: "A/R", type: "asset" },
  { id: "cc", name: "Card", type: "liability" },
  { id: "draw", name: "Owner draws", type: "equity" },
  { id: "svc", name: "Services", type: "income" },
  { id: "dev", name: "Development", type: "income" },
  { id: "sw", name: "Software", type: "expense" },
  { id: "fee", name: "Processor fees", type: "expense" },
];
const post = (lines: { accountId: string; debit: number; credit: number }[], date = "2026-10-01"): PostedLine[] =>
  lines.map((l) => ({ ...l, date }));

describe("invoices", () => {
  const lines = [
    { description: "Discovery", quantity: 1, rate: 75000, accountId: "svc" },
    { description: "Build hours", quantity: 2.5, rate: 12000, accountId: "dev" },
    { description: "Hosting setup", quantity: 1, rate: 5000, accountId: "svc" },
  ];

  it("totals lines, rounding fractional quantities to cents", () => {
    expect(lineAmount(2.5, 12000)).toBe(30000);
    expect(lineAmount(1.333, 1000)).toBe(1333);
    expect(invoiceTotal(lines)).toBe(110000);
  });

  it("validates lines", () => {
    expect(validateInvoiceLines(lines)).toBeNull();
    expect(validateInvoiceLines([])).toMatch(/at least one/);
    expect(validateInvoiceLines([{ ...lines[0], description: " " }])).toMatch(/description/);
    expect(validateInvoiceLines([{ ...lines[0], quantity: 0 }])).toMatch(/quantity/);
    expect(validateInvoiceLines([{ ...lines[0], rate: 10.5 }])).toMatch(/rate/);
  });

  it("posts A/R against income, grouped by income account, and balances", () => {
    const p = invoicePostingLines("ar", lines);
    expect(validateLines(p)).toBeNull();
    expect(p).toEqual([
      { accountId: "ar", debit: 110000, credit: 0 },
      { accountId: "svc", debit: 0, credit: 80000 },
      { accountId: "dev", debit: 0, credit: 30000 },
    ]);
  });

  it("payment with a processor fee clears A/R and records the fee", () => {
    const p = paymentPostingLines("ar", "chk", 110000, { accountId: "fee", amount: 3220 });
    expect(validateLines(p)).toBeNull();
    const all = [...post(invoicePostingLines("ar", lines)), ...post(p)];
    const bs = balanceSheet(accounts, all);
    expect(bs.assets.find((a) => a.id === "ar")).toBeUndefined(); // A/R back to zero
    expect(bs.assets.find((a) => a.id === "chk")?.balance).toBe(106780);
    expect(profitAndLoss(accounts, all).netIncome).toBe(110000 - 3220);
    expect(bs.balanced).toBe(true);
  });

  it("status follows the amount paid", () => {
    expect(invoiceStatusAfterPayment(1000, 0)).toBe("sent");
    expect(invoiceStatusAfterPayment(1000, 400)).toBe("partial");
    expect(invoiceStatusAfterPayment(1000, 1000)).toBe("paid");
  });

  it("numbers continue after QuickBooks' highest", () => {
    expect(nextInvoiceNumber([])).toBe("1001");
    expect(nextInvoiceNumber(["1001", "1003", "550004", "abc"])).toBe("1004");
  });
});

describe("cash postings (expenses, refunds, bank rows)", () => {
  it("money out of checking: expense up, checking down", () => {
    const p = cashPostingLines("chk", "sw", -2000);
    expect(p).toEqual([
      { accountId: "sw", debit: 2000, credit: 0, memo: undefined },
      { accountId: "chk", debit: 0, credit: 2000, memo: undefined },
    ]);
  });

  it("card charge raises what's owed; card refund lowers it", () => {
    const lines = [...post(cashPostingLines("cc", "sw", -10000)), ...post(cashPostingLines("cc", "sw", 2500))];
    const bs = balanceSheet(accounts, lines);
    expect(bs.liabilities.find((a) => a.id === "cc")?.balance).toBe(7500);
    expect(profitAndLoss(accounts, lines).totalExpenses).toBe(7500);
    expect(bs.balanced).toBe(true);
  });

  it("deposit into checking credits income", () => {
    const lines = post(cashPostingLines("chk", "svc", 95800));
    expect(profitAndLoss(accounts, lines).totalIncome).toBe(95800);
  });

  it("rejects zero and fractional amounts", () => {
    expect(() => cashPostingLines("chk", "sw", 0)).toThrow();
    expect(() => cashPostingLines("chk", "sw", 1.5)).toThrow();
  });
});

describe("bank CSV", () => {
  it("reads a Chase checking export", () => {
    const csv = [
      "Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #",
      'DEBIT,10/24/2026,"ORIG CO NAME:CHASE CREDIT CRD AUTOPAY",-116.60,ACH_DEBIT,4153.72,,',
      "CREDIT,10/21/2026,QUICKBOOKS PAYMENTS DEPOSIT,218.27,ACH_CREDIT,4270.32,,",
      "DEBIT,10/21/2026,QUICKBOOKS PAYMENTS DEPOSIT,218.27,ACH_CREDIT,4270.32,,",
    ].join("\n");
    const r = parseBankCsv(csv);
    expect(r.format).toBe("Chase checking");
    expect(r.errors).toEqual([]);
    expect(r.rows.map((x) => [x.date, x.amount])).toEqual([
      ["2026-10-21", 21827],
      ["2026-10-21", 21827],
      ["2026-10-24", -11660],
    ]);
    // Same date/amount/description twice: both kept, with different hashes.
    expect(new Set(r.rows.map((x) => x.hash)).size).toBe(3);
  });

  it("reads a Chase card export (charges negative, payments positive)", () => {
    const csv = [
      "Transaction Date,Post Date,Description,Category,Type,Amount,Memo",
      "10/27/2026,10/28/2026,PSKOOLCOM SNTYZ,Shopping,Sale,-7.00,",
      "10/26/2026,10/26/2026,Payment Thank You-Mobile,,Payment,116.60,",
    ].join("\n");
    const r = parseBankCsv(csv);
    expect(r.format).toBe("Chase card");
    expect(r.rows.map((x) => [x.date, x.description, x.amount])).toEqual([
      ["2026-10-26", "Payment Thank You-Mobile", 11660],
      ["2026-10-27", "PSKOOLCOM SNTYZ", -700],
    ]);
  });

  it("reads debit/credit columns", () => {
    const r = parseBankCsv("Date,Description,Debit,Credit\n2026-01-02,Coffee,4.50,\n2026-01-03,Client,,100.00");
    expect(r.rows.map((x) => x.amount)).toEqual([-450, 10000]);
  });

  it("reports bad rows and unknown layouts", () => {
    expect(parseBankCsv("foo,bar\n1,2").errors[0]).toMatch(/columns/);
    const r = parseBankCsv("Date,Description,Amount\nnot a date,x,1.00\n01/05/2026,ok,abc\n01/06/2026,good,-1.00");
    expect(r.rows).toHaveLength(1);
    expect(r.errors).toHaveLength(2);
  });
});

describe("rules and matching", () => {
  const rules = [
    { contains: "upwork", accountId: "ads", active: true },
    { contains: "upwork escrow", accountId: "svc", active: true },
    { contains: "claude", accountId: "sw", active: false },
  ];

  it("picks the most specific active rule", () => {
    expect(matchRule("BT UPWORK 9574548", rules)?.accountId).toBe("ads");
    expect(matchRule("ORIG CO NAME:Upwork  Escrow Inc", rules)?.accountId).toBe("svc");
    expect(matchRule("Claude.ai subscription", rules)).toBeNull();
  });

  it("finds ledger entries with the same amount within 5 days, closest first", () => {
    const cands = [
      { entryId: "e1", date: "2026-10-20", amount: -4860 },
      { entryId: "e2", date: "2026-10-08", amount: -4860 },
      { entryId: "e3", date: "2026-10-07", amount: -4860 },
      { entryId: "e4", date: "2026-10-07", amount: -4800 },
    ];
    const m = findMatches({ date: "2026-10-07", amount: -4860 }, cands, new Set());
    expect(m.map((x) => x.entryId)).toEqual(["e3", "e2"]);
    expect(findMatches({ date: "2026-10-07", amount: -4860 }, cands, new Set(["e3"])).map((x) => x.entryId)).toEqual(["e2"]);
  });
});
