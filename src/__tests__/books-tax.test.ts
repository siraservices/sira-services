import {
  estimateDueDates,
  form1099Threshold,
  guessScheduleCLine,
  mileageDeduction,
  mileageRate,
  scheduleC,
  selfEmploymentTax,
} from "../../convex/booksTaxLib";

describe("Schedule C line guesses for the QuickBooks chart", () => {
  it.each([
    ["Services", "income", "1"],
    ["Refunds to customers", "income", "2"],
    ["Other income:Credit card rewards", "income", "6"],
    ["Advertising & marketing:Social media", "expense", "8"],
    ["Vehicle expenses:Vehicle insurance", "expense", "9"],
    ["QuickBooks Payments Fees", "expense", "10"],
    ["Office expenses:Merchant account fees", "expense", "10"],
    ["Contract labor", "expense", "11"],
    ["Cost of goods sold:Subcontractor expenses", "expense", "4"],
    ["Insurance:Liability insurance", "expense", "15"],
    ["Interest paid:Credit card interest", "expense", "16b"],
    ["Legal & accounting services:Accounting fees", "expense", "17"],
    ["Office expenses:Software & apps", "expense", "18"],
    ["Equipment rental", "expense", "20a"],
    ["Building & property rent", "expense", "20b"],
    ["Home office:Rent", "expense", "30"],
    ["Supplies:Supplies & materials", "expense", "22"],
    ["Office expenses:Office supplies", "expense", "18"],
    ["Office expenses:Small tools and equipment", "expense", "22"],
    ["Payroll expenses:Taxes", "expense", "23"],
    ["Taxes paid", "expense", "23"],
    ["Business licences", "expense", "23"],
    ["Meals:Travel meals", "expense", "24b"],
    ["Travel:Airfare", "expense", "24a"],
    ["Utilities:Internet & TV services", "expense", "25"],
    ["Payroll expenses:Wages", "expense", "26"],
    ["General business expenses:Bank fees & service charges", "expense", "27a"],
    ["Entertainment with clients", "expense", "none"],
    ["Contributions to charities", "expense", "none"],
    ["Owner draws", "equity", "none"],
  ])("%s → %s", (name, type, line) => expect(guessScheduleCLine(name, type)).toBe(line));
});

describe("scheduleC", () => {
  const accounts = [
    { id: "s", name: "Services", type: "income" },
    { id: "r", name: "Refunds to customers", type: "income" },
    { id: "sw", name: "Office expenses:Software & apps", type: "expense" },
    { id: "m", name: "Meals", type: "expense" },
    { id: "e", name: "Entertainment with clients", type: "expense" },
    { id: "ads", name: "Upwork fees", type: "expense", scheduleCLine: "8" }, // mapped by hand
    { id: "chk", name: "Checking", type: "asset" },
  ];
  it("totals by line, halves meals, nets refunds, adds mileage, skips non-deductible", () => {
    const r = scheduleC(accounts, [
      { accountId: "s", debit: 0, credit: 1000000 },
      { accountId: "r", debit: 50000, credit: 0 },
      { accountId: "sw", debit: 30000, credit: 0 },
      { accountId: "sw", debit: 0, credit: 5000 }, // refund
      { accountId: "m", debit: 10001, credit: 0 },
      { accountId: "e", debit: 20000, credit: 0 },
      { accountId: "ads", debit: 4860, credit: 0 },
      { accountId: "chk", debit: 999999, credit: 0 },
    ], 7250);
    const by = Object.fromEntries(r.lines.map((l) => [l.code, l.amount]));
    expect(by).toEqual({ "1": 1000000, "2": 50000, "8": 4860, "9": 7250, "18": 25000, "24b": 5001, none: 20000 });
    expect(r.mealsFull).toBe(10001);
    expect(r.grossIncome).toBe(950000);
    expect(r.totalExpenses).toBe(4860 + 7250 + 25000 + 5001);
    expect(r.netProfit).toBe(950000 - 42111);
  });
});

describe("mileage", () => {
  it("uses the IRS rate for the date, including the July 2026 increase", () => {
    expect(mileageRate("2025-12-31")).toBe(700);
    expect(mileageRate("2026-06-30")).toBe(725);
    expect(mileageRate("2026-07-01")).toBe(760);
    expect(mileageDeduction(10, "2026-03-01")).toBe(725); // $7.25
    expect(mileageDeduction(12.5, "2026-08-01")).toBe(950); // $9.50
  });
});

describe("self-employment tax", () => {
  it("is 15.3% of 92.35% of profit, with the Social Security cap", () => {
    expect(selfEmploymentTax(1000000, 2026)).toEqual({
      earnings: 923500, socialSecurity: 114514, medicare: 26782, total: 141296, deductibleHalf: 70648,
    });
    const big = selfEmploymentTax(30000000, 2026);
    expect(big.socialSecurity).toBe(Math.round(18450000 * 0.124));
    expect(selfEmploymentTax(40000, 2026).total).toBe(0); // under $400 of SE earnings
    expect(selfEmploymentTax(-5000, 2026).total).toBe(0);
  });
  it("due dates and 1099 threshold", () => {
    expect(estimateDueDates(2026).map((d) => d.due)).toEqual(["2026-04-15", "2026-06-15", "2026-09-15", "2027-01-15"]);
    expect(form1099Threshold(2025)).toBe(60000);
    expect(form1099Threshold(2026)).toBe(200000);
  });
});
