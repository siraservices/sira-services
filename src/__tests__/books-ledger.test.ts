import {
  decideBind,
  balanceSheet,
  formatCents,
  isIsoDate,
  profitAndLoss,
  reversalLines,
  toCents,
  trialBalance,
  validateLines,
  type AccountInfo,
  type PostedLine,
} from "../../convex/booksLib";
import { mapQboType, parseCsv, parseQboAccounts, parseQboJournal, qboDate } from "../../convex/booksImportLib";

const accounts: AccountInfo[] = [
  { id: "chk", name: "Checking", type: "asset" },
  { id: "cc", name: "Card", type: "liability" },
  { id: "draw", name: "Owner draws", type: "equity" },
  { id: "inc", name: "Services", type: "income" },
  { id: "sw", name: "Software", type: "expense" },
];

const line = (accountId: string, debit: number, credit: number, date = "2026-01-15"): PostedLine => ({
  accountId,
  debit,
  credit,
  date,
});

describe("money", () => {
  it("parses amounts to cents", () => {
    expect(toCents("12.34")).toBe(1234);
    expect(toCents("1,234.5")).toBe(123450);
    expect(toCents("(5.00)")).toBe(-500);
    expect(toCents("-0.07")).toBe(-7);
    expect(toCents("$958")).toBe(95800);
    expect(toCents("")).toBe(0);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(() => toCents("12.345")).toThrow();
    expect(() => toCents("abc")).toThrow();
  });
  it("formats cents", () => {
    expect(formatCents(123456)).toBe("$1,234.56");
    expect(formatCents(-700)).toBe("-$7.00");
  });
  it("validates ISO dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("02/28/2026")).toBe(false);
  });
});

describe("validateLines", () => {
  it("accepts a balanced entry", () => {
    expect(
      validateLines([
        { accountId: "sw", debit: 2000, credit: 0 },
        { accountId: "cc", debit: 0, credit: 2000 },
      ]),
    ).toBeNull();
  });
  it("rejects unbalanced, one-line, two-sided, zero and fractional lines", () => {
    expect(validateLines([{ accountId: "sw", debit: 1, credit: 0 }])).toMatch(/two lines/);
    expect(
      validateLines([
        { accountId: "sw", debit: 2000, credit: 0 },
        { accountId: "cc", debit: 0, credit: 1999 },
      ]),
    ).toMatch(/balance/);
    expect(
      validateLines([
        { accountId: "sw", debit: 100, credit: 100 },
        { accountId: "cc", debit: 0, credit: 0 },
      ]),
    ).toMatch(/not both/);
    expect(
      validateLines([
        { accountId: "sw", debit: 0.5, credit: 0 },
        { accountId: "cc", debit: 0, credit: 0.5 },
      ]),
    ).toMatch(/whole cents/);
  });
  it("reversal swaps sides", () => {
    expect(reversalLines([{ accountId: "sw", debit: 5, credit: 0 }])).toEqual([
      { accountId: "sw", debit: 0, credit: 5 },
    ]);
  });
});

describe("reports", () => {
  const lines: PostedLine[] = [
    // $1,000 invoice paid to checking
    line("chk", 100000, 0),
    line("inc", 0, 100000),
    // $20 software on the card
    line("sw", 2000, 0),
    line("cc", 0, 2000),
    // $15 card payment from checking
    line("cc", 1500, 0),
    line("chk", 0, 1500),
    // $100 owner draw
    line("draw", 10000, 0),
    line("chk", 0, 10000),
  ];

  it("P&L", () => {
    const pl = profitAndLoss(accounts, lines);
    expect(pl.totalIncome).toBe(100000);
    expect(pl.totalExpenses).toBe(2000);
    expect(pl.netIncome).toBe(98000);
  });

  it("balance sheet balances, with net income in equity", () => {
    const bs = balanceSheet(accounts, lines);
    expect(bs.totalAssets).toBe(88500);
    expect(bs.totalLiabilities).toBe(500);
    expect(bs.totalEquity).toBe(88000); // 98,000 income - 10,000 draws
    expect(bs.balanced).toBe(true);
  });

  it("trial balance debits equal credits", () => {
    const tb = trialBalance(accounts, lines);
    expect(tb.debit).toBe(tb.credit);
  });
});

describe("access rule", () => {
  const owner = "aira4development@gmail.com";
  it("only the owner email can create access on its own", () => {
    expect(decideBind(null, owner, "user_1")).toBe("create-owner");
    expect(decideBind(null, "AIRA4development@Gmail.com ", "user_1")).toBe("create-owner");
    expect(decideBind(null, "someone-else@example.com", "user_2")).toBe("deny");
    expect(decideBind(null, "someone@example.com", "user_3")).toBe("deny");
  });
  it("invited emails bind once; revoked or re-bound accounts are denied", () => {
    expect(decideBind({ email: "cpa@firm.com", active: true }, "cpa@firm.com", "user_9")).toBe("bind");
    expect(decideBind({ email: "cpa@firm.com", active: true, userId: "user_9" }, "cpa@firm.com", "user_9")).toBe("already");
    expect(decideBind({ email: "cpa@firm.com", active: true, userId: "user_9" }, "cpa@firm.com", "user_X")).toBe("deny");
    expect(decideBind({ email: "cpa@firm.com", active: false }, "cpa@firm.com", "user_9")).toBe("deny");
  });
});

describe("QuickBooks import", () => {
  it("parses quoted CSV", () => {
    expect(parseCsv('a,"b, c","d ""e"""\r\n1,2,3')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "2", "3"],
    ]);
  });

  it("maps QBO types and dates", () => {
    expect(mapQboType("Bank")).toBe("asset");
    expect(mapQboType("Credit Card")).toBe("liability");
    expect(mapQboType("Equity")).toBe("equity");
    expect(mapQboType("Other Income")).toBe("income");
    expect(mapQboType("Expenses")).toBe("expense");
    expect(mapQboType("Cost of Goods Sold")).toBe("expense");
    expect(qboDate("3/9/2025")).toBe("2025-03-09");
    expect(qboDate("Accrual Basis")).toBeNull();
  });

  it("parses an account list", () => {
    const csv = [
      "Account List",
      "Aira Development LLC",
      "",
      "Account,Type,Detail type,Description,Balance",
      "Chase Business Checking Account,Bank,Checking,,1234.56",
      "Business Chase Credit Card,Credit Card,Credit Card,,-98.76",
      "Office expenses:Software & apps,Expenses,Office/General Administrative Expenses,,",
    ].join("\n");
    const { accounts: out, errors } = parseQboAccounts(csv);
    expect(errors).toEqual([]);
    expect(out.map((a) => [a.name, a.type])).toEqual([
      ["Chase Business Checking Account", "asset"],
      ["Business Chase Credit Card", "liability"],
      ["Office expenses:Software & apps", "expense"],
    ]);
  });

  it("groups journal rows into balanced entries", () => {
    const csv = [
      "Journal",
      "Aira Development LLC",
      "All Dates",
      "",
      ",Date,Transaction Type,Num,Name,Memo/Description,Account,Debit,Credit",
      ",03/10/2026,Expense,,Anthropic,Claude,Office expenses:Software & apps,100.00,",
      ",,,,Anthropic,Claude,Business Chase Credit Card,,100.00",
      ",,,,,,,$100.00,$100.00",
      ",09/27/2023,Invoice,550004,Sam,,Accounts Receivable (A/R),958.00,",
      ",,,,Sam,Web build,Services,,958.00",
      ",,,,,,,$958.00,$958.00",
      ",07/22/2025,Credit Card Credit,,Intuit,Refund,Business Chase Credit Card,42.22,",
      ",,,,Intuit,Refund,Office expenses:Software & apps,-42.22,",
      "TOTAL,,,,,,,$1100.22,$1100.22",
      "",
      "Accrual basis Thursday, October 29, 2026",
    ].join("\n");
    const { entries, errors } = parseQboJournal(csv);
    expect(errors).toEqual([]);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({ date: "2026-03-10", txnType: "Expense" });
    expect(entries[0].lines).toEqual([
      expect.objectContaining({ accountName: "Office expenses:Software & apps", debit: 10000, credit: 0 }),
      expect.objectContaining({ accountName: "Business Chase Credit Card", debit: 0, credit: 10000 }),
    ]);
    expect(entries[1]).toMatchObject({ num: "550004" });
    // Negative debit becomes a credit.
    expect(entries[2].lines[1]).toMatchObject({ debit: 0, credit: 4222 });
    expect(new Set(entries.map((e) => e.sourceRef)).size).toBe(3);
  });

  it("reads the 2026 grouped Journal export (id rows, dates on every line, voids skipped)", () => {
    const csv = [
      "Aira Development LLC,,,,,,,,",
      "Journal,,,,,,,,",
      "All Dates,,,,,,,,",
      "",
      ",Transaction date,Transaction type,Num,Name,Description,Account Name,Debit,Credit",
      "1,,,,,,,,",
      ",06/30/2023,Check,,,Voided - Opening Balance from Bank,Chase Business Checking Account,0.00,",
      ",06/30/2023,Check,,,,Opening balance equity,0.00,",
      "Total for 1,,,,,,,$0.00,$0.00",
      "4,,,,,,,,",
      ",06/30/2023,Expense,,Chase Account Maintenance Fee,MONTHLY SERVICE FEE,Chase Business Checking Account,,15.00",
      ",06/30/2023,Expense,,Chase Account Maintenance Fee,MONTHLY SERVICE FEE,General business expenses:Bank fees & service charges,15.00,",
      "Total for 4,,,,,,,$15.00,$15.00",
      "14,,,,,,,,",
      ",07/26/2023,Transfer,,,Zelle payment,Owner investments,,100.00",
      ",07/26/2023,Transfer,,,Zelle payment,Chase Business Checking Account,100.00,",
      "Total for 14,,,,,,,$100.00,$100.00",
      'TOTAL,,,,,,,"$115.00","$115.00"',
    ].join("\n");
    const { entries, errors } = parseQboJournal(csv);
    expect(errors).toEqual([]);
    expect(entries.map((e) => e.sourceRef)).toEqual([
      "qbo:4|2023-06-30|Expense",
      "qbo:14|2023-07-26|Transfer",
    ]);
    expect(entries[0].lines).toHaveLength(2);
    expect(entries[0].memo).toBe("MONTHLY SERVICE FEE");
  });

  it("reads the Account Name header", () => {
    const { accounts: out } = parseQboAccounts(
      "Aira Development LLC,,,,\nAccount List,,,,\n\nAccount Name,Type,Detail type,Description,Total balance\nCash on hand,Bank,Cash on hand,,\"1,250.00\"",
    );
    expect(out).toEqual([expect.objectContaining({ name: "Cash on hand", type: "asset" })]);
  });

  it("flags entries that don't balance", () => {
    const csv = [
      "Date,Transaction Type,Num,Name,Memo/Description,Account,Debit,Credit",
      "01/01/2026,Journal Entry,1,,,Checking,10.00,",
      ",,,,,Services,,9.00",
    ].join("\n");
    const { entries, errors } = parseQboJournal(csv);
    expect(entries[0].error).toMatch(/balance/);
    expect(errors).toHaveLength(1);
  });
});

describe("QuickBooks contact lists", () => {
  const { parseQboContacts, contactKindFromTxns } = jest.requireActual("../../convex/booksImportLib");
  it("reads the Customer Contact List report", () => {
    const csv = [
      "Customer Contact List,,,,",
      "Aira Development LLC,,,,",
      ",,,,",
      "Customer full name,Phone numbers,Email,Full name,Billing address",
      "Sam Carter,Phone: (215) 555-0101,sam@example.com,Sam Carter,\"12 Main St  Philadelphia, PA 19148\"",
      "Pat Rivera,,mike@example.com,,",
      "sam carter,,,,",
      ",,,,",
      "\"Thursday, October 29, 2026 03:00 PM GMT-04:00\",,,,",
    ].join("\n");
    const r = parseQboContacts(csv, "customer");
    expect(r.contacts).toEqual([
      { name: "Sam Carter", kind: "customer", email: "sam@example.com", phone: "(215) 555-0101", company: undefined, address: "12 Main St Philadelphia, PA 19148" },
      { name: "Pat Rivera", kind: "customer", email: "mike@example.com", phone: undefined, company: undefined, address: undefined },
    ]);
  });
  it("guesses kind from transaction types", () => {
    expect(contactKindFromTxns(["Deposit", "Invoice"])).toBe("customer");
    expect(contactKindFromTxns(["Expense", "Deposit"])).toBe("vendor");
    expect(contactKindFromTxns(["Deposit"])).toBe("customer");
    expect(contactKindFromTxns(["Payroll Check"])).toBe("other");
  });
});

describe("CSV export", () => {
  const { toCsv, centsToPlain } = jest.requireActual("../../convex/booksLib");
  it("formats cents and escapes cells", () => {
    expect(centsToPlain(123456)).toBe("1234.56");
    expect(centsToPlain(-5)).toBe("-0.05");
    expect(centsToPlain(0)).toBe("0.00");
    expect(toCsv([["a,b", 'say "hi"', "line\nbreak", null, 3]])).toBe('"a,b","say ""hi""","line\nbreak",,3\r\n');
    expect(toCsv([["=HYPERLINK(\"x\")", "-12.50", "+1"]])).toBe("\"'=HYPERLINK(\"\"x\"\")\",-12.50,'+1\r\n");
  });
});
