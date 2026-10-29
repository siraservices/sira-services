/// <reference types="vite/client" />
// End-to-end tests for Sira Books' Convex functions, run against an
// in-memory Convex backend (convex-test). `npm run test:convex`.

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");
const OWNER = "aira4development@gmail.com";

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.booksAuth.bindMember, { userId: "user_owner", email: OWNER });
  const me = t.withIdentity({ subject: "user_owner", issuer: "https://api.workos.com/" });
  await me.mutation(api.booksAccounts.seedStarterChart, {});
  const accts = await me.query(api.booksAccounts.list, {});
  const id = (name: string) => {
    const a = accts.find((x) => x.name === name);
    if (!a) throw new Error(`no account ${name}`);
    return a._id;
  };
  const fee = await me.mutation(api.booksAccounts.create, { name: "Stripe fees", type: "expense" });
  return {
    t,
    me,
    chk: id("Chase Business Checking Account"),
    card: id("Business Chase Credit Card"),
    ar: id("Accounts Receivable (A/R)"),
    services: id("Services"),
    software: id("Office expenses:Software & apps"),
    ads: id("Advertising & marketing"),
    fee,
  };
}

async function balances(me: Awaited<ReturnType<typeof setup>>["me"]) {
  const bs = await me.query(api.booksReports.balanceSheetReport, { asOf: "2099-12-31" });
  const tb = await me.query(api.booksReports.trialBalanceReport, { asOf: "2099-12-31" });
  expect(bs.balanced).toBe(true);
  expect(tb.debit).toBe(tb.credit);
  const by = new Map([...bs.assets, ...bs.liabilities, ...bs.equity].map((r) => [r.name, r.balance]));
  return { bs, get: (n: string) => by.get(n) ?? 0 };
}

describe("access", () => {
  it("only the bound owner (or an invitee) gets in", async () => {
    const { t, me } = await setup();
    expect(await me.query(api.booksAuth.access, {})).toMatchObject({ allowed: true, role: "owner" });

    const stranger = t.withIdentity({ subject: "user_stranger" });
    expect(await stranger.query(api.booksAuth.access, {})).toMatchObject({ allowed: false });
    await expect(stranger.query(api.booksInvoices.list, {})).rejects.toThrow(/access/);
    await expect(stranger.mutation(api.booksExpenses.generateUploadUrl, {})).rejects.toThrow(/access/);
    await expect(t.query(api.booksBank.counts, {})).rejects.toThrow(/access/);

    // A different WorkOS account with some other email can't bind.
    expect(await t.mutation(internal.booksAuth.bindMember, { userId: "user_x", email: "someone-else@example.com" })).toEqual({
      allowed: false,
    });
    // Nor can a second account claiming the owner email.
    expect(await t.mutation(internal.booksAuth.bindMember, { userId: "user_y", email: OWNER })).toEqual({ allowed: false });

    // Invite, bind, then revoke.
    await me.mutation(api.booksAuth.invite, { email: "cpa@firm.com" });
    expect(await t.mutation(internal.booksAuth.bindMember, { userId: "user_cpa", email: "CPA@firm.com" })).toEqual({
      allowed: true,
    });
    const cpa = t.withIdentity({ subject: "user_cpa" });
    await expect(cpa.query(api.booksInvoices.list, {})).resolves.toEqual([]);
    await expect(cpa.mutation(api.booksAuth.invite, { email: "x@y.com" })).rejects.toThrow(/owner/);
    const row = (await me.query(api.booksAuth.listMembers, {})).find((m) => m.email === "cpa@firm.com")!;
    await me.mutation(api.booksAuth.revoke, { id: row._id });
    await expect(cpa.query(api.booksInvoices.list, {})).rejects.toThrow(/access/);
  });
});

describe("invoices", () => {
  it("draft → sent → partly paid (with fee) → paid → void, books stay balanced", async () => {
    const s = await setup();
    const { me } = s;
    const sam = await me.mutation(api.booksContacts.create, { name: "Sam", kind: "customer", email: "j@x.com" });
    expect(await me.query(api.booksInvoices.nextNumber, {})).toBe("1001");

    const id = await me.mutation(api.booksInvoices.saveDraft, {
      number: "1001",
      contactId: sam,
      issueDate: "2026-11-01",
      dueDate: "2026-11-16",
      lines: [
        { description: "Discovery", quantity: 1, rate: 75000, accountId: s.services },
        { description: "Build", quantity: 2.5, rate: 10000, accountId: s.services },
      ],
    });
    // Drafts don't touch the ledger.
    expect((await me.query(api.booksReports.trialBalanceReport, { asOf: "2099-12-31" })).debit).toBe(0);
    await expect(
      me.mutation(api.booksInvoices.recordPayment, { invoiceId: id, date: "2026-11-02", amount: 100, depositAccountId: s.chk }),
    ).rejects.toThrow(/Send/);
    // Duplicate number and non-income account are refused.
    await expect(
      me.mutation(api.booksInvoices.saveDraft, {
        number: "1001", contactId: sam, issueDate: "2026-11-01", dueDate: "2026-11-02",
        lines: [{ description: "x", quantity: 1, rate: 1, accountId: s.services }],
      }),
    ).rejects.toThrow(/already exists/);
    await expect(
      me.mutation(api.booksInvoices.saveDraft, {
        id, number: "1001", contactId: sam, issueDate: "2026-11-01", dueDate: "2026-11-02",
        lines: [{ description: "x", quantity: 1, rate: 1, accountId: s.software }],
      }),
    ).rejects.toThrow(/income account/);

    await me.mutation(api.booksInvoices.send, { id });
    await expect(me.mutation(api.booksInvoices.send, { id })).rejects.toThrow(/already/);
    let b = await balances(me);
    expect(b.get("Accounts Receivable (A/R)")).toBe(100000);
    expect(await me.query(api.booksInvoices.nextNumber, {})).toBe("1002");

    // Can't deposit to A/R itself; can't overpay; fee needs an expense account.
    await expect(
      me.mutation(api.booksInvoices.recordPayment, { invoiceId: id, date: "2026-11-05", amount: 1000, depositAccountId: s.ar }),
    ).rejects.toThrow(/bank or cash/);
    await expect(
      me.mutation(api.booksInvoices.recordPayment, { invoiceId: id, date: "2026-11-05", amount: 100001, depositAccountId: s.chk }),
    ).rejects.toThrow(/more than the balance/);

    const pay1 = await me.mutation(api.booksInvoices.recordPayment, {
      invoiceId: id, date: "2026-11-05", amount: 40000, fee: 1190, feeAccountId: s.fee, depositAccountId: s.chk, method: "Stripe",
    });
    expect((await me.query(api.booksInvoices.get, { id }))?.status).toBe("partial");
    await me.mutation(api.booksInvoices.recordPayment, {
      invoiceId: id, date: "2026-11-10", amount: 60000, depositAccountId: s.chk, method: "Zelle",
    });
    const paid = await me.query(api.booksInvoices.get, { id });
    expect(paid?.status).toBe("paid");
    b = await balances(me);
    expect(b.get("Accounts Receivable (A/R)")).toBe(0);
    expect(b.get("Chase Business Checking Account")).toBe(100000 - 1190);
    const pl = await me.query(api.booksReports.profitAndLossReport, { from: "2026-01-01", to: "2026-12-31" });
    expect(pl.totalIncome).toBe(100000);
    expect(pl.totalExpenses).toBe(1190);

    // The bank feed matches the first deposit, then the invoice is voided:
    // the matched bank row must come back to review.
    await me.mutation(api.booksBank.importRows, {
      accountId: s.chk,
      rows: [{ date: "2026-11-06", description: "STRIPE TRANSFER", amount: 40000 - 1190, hash: "h1" }],
    });
    const [row] = await me.query(api.booksBank.review, { accountId: s.chk });
    expect(row.matches.map((m) => m.entryId)).toContain(pay1);
    await me.mutation(api.booksBank.match, { id: row._id, entryId: pay1 });
    // The journal can't reverse invoice entries behind the invoice's back.
    await expect(me.mutation(api.booksLedger.reverse, { entryId: pay1, date: "2026-11-20" })).rejects.toThrow(/Invoices page/);

    await me.mutation(api.booksInvoices.voidInvoice, { id, date: "2026-11-20" });
    expect((await me.query(api.booksInvoices.get, { id }))?.status).toBe("void");
    b = await balances(me);
    expect(b.get("Accounts Receivable (A/R)")).toBe(0);
    expect(b.get("Chase Business Checking Account")).toBe(0);
    const pl2 = await me.query(api.booksReports.profitAndLossReport, { from: "2026-01-01", to: "2026-12-31" });
    expect(pl2.netIncome).toBe(0);
    const back = await me.query(api.booksBank.review, { accountId: s.chk });
    expect(back.map((r) => r._id)).toEqual([row._id]); // back in review
    expect((await me.query(api.booksInvoices.agingSummary, { today: "2026-12-31" })).count).toBe(0);
  });

  it("aging buckets", async () => {
    const s = await setup();
    const c = await s.me.mutation(api.booksContacts.create, { name: "Acme", kind: "customer" });
    for (const [n, due] of [["1001", "2026-12-10"], ["1002", "2026-11-15"], ["1003", "2026-08-01"]] as const) {
      const id = await s.me.mutation(api.booksInvoices.saveDraft, {
        number: n, contactId: c, issueDate: "2026-07-01", dueDate: due,
        lines: [{ description: "Work", quantity: 1, rate: 10000, accountId: s.services }],
      });
      await s.me.mutation(api.booksInvoices.send, { id });
    }
    const a = await s.me.query(api.booksInvoices.agingSummary, { today: "2026-12-01" });
    expect(a).toMatchObject({ count: 3, total: 30000, current: 10000, d1_30: 10000, d90plus: 10000 });
  });
});

describe("expenses and receipts", () => {
  it("posts expenses and refunds against bank or card, with receipts", async () => {
    const s = await setup();
    const { t, me } = s;
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["%PDF-1.4 receipt"], { type: "application/pdf" })));
    const e1 = await me.mutation(api.booksExpenses.create, {
      date: "2026-11-03", payee: "Anthropic", amount: 10000, paidFromAccountId: s.card, categoryAccountId: s.software,
      receipts: [{ storageId, fileName: "claude.pdf" }],
    });
    await me.mutation(api.booksExpenses.create, {
      date: "2026-11-04", payee: "Anthropic", amount: 2500, isRefund: true, paidFromAccountId: s.card, categoryAccountId: s.software,
    });
    await me.mutation(api.booksExpenses.create, {
      date: "2026-11-04", payee: "Google Ads", amount: 5000, paidFromAccountId: s.chk, categoryAccountId: s.ads,
    });
    const b = await balances(me);
    expect(b.get("Business Chase Credit Card")).toBe(7500); // owed
    expect(b.get("Chase Business Checking Account")).toBe(-5000);
    const pl = await me.query(api.booksReports.profitAndLossReport, { from: "2026-01-01", to: "2026-12-31" });
    expect(pl.totalExpenses).toBe(12500);

    const recent = await me.query(api.booksExpenses.recent, {});
    expect(recent.find((e) => e._id === e1)?.receipts.map((r) => r.fileName)).toEqual(["claude.pdf"]);
    // The same file can't be attached twice.
    await expect(me.mutation(api.booksExpenses.attachReceipts, { entryId: e1, receipts: [{ storageId, fileName: "again.pdf" }] }))
      .rejects.toThrow(/already attached/);
    // Paid-from must be a bank/card, and the category must differ.
    await expect(me.mutation(api.booksExpenses.create, {
      date: "2026-11-04", amount: 1, paidFromAccountId: s.software, categoryAccountId: s.ads,
    })).rejects.toThrow(/bank or card/);
    // Unattached uploads can be discarded; attached ones are kept.
    const stray = await t.run((ctx) => ctx.storage.store(new Blob(["x"])));
    await me.mutation(api.booksExpenses.discardUploads, { storageIds: [stray, storageId] });
    expect(await t.run((ctx) => ctx.storage.getUrl(stray))).toBeNull();
    expect(await t.run((ctx) => ctx.storage.getUrl(storageId))).not.toBeNull();
  });
});

describe("bank feed", () => {
  it("imports once, suggests by rule, posts, undoes and re-posts", async () => {
    const s = await setup();
    const { me } = s;
    const rows = [
      { date: "2026-11-01", description: "BT UPWORK 1234567", amount: -4860, hash: "a" },
      { date: "2026-11-02", description: "Claude.ai subscription", amount: -2000, hash: "b" },
    ];
    expect(await me.mutation(api.booksBank.importRows, { accountId: s.card, rows })).toEqual({ added: 2, skipped: 0 });
    expect(await me.mutation(api.booksBank.importRows, { accountId: s.card, rows })).toEqual({ added: 0, skipped: 2 });
    expect(await me.query(api.booksBank.counts, {})).toEqual({ [s.card]: 2 });

    await me.mutation(api.booksBank.createRule, { contains: "upwork", accountId: s.ads });
    let review = await me.query(api.booksBank.review, { accountId: s.card });
    const upwork = review.find((r) => r.description.includes("UPWORK"))!;
    const claude = review.find((r) => r.description.includes("Claude"))!;
    expect(upwork.suggestedAccountId).toBe(s.ads);
    expect(claude.suggestedAccountId).toBeNull();

    await me.mutation(api.booksBank.postMany, { items: [{ id: upwork._id, categoryAccountId: s.ads }] });
    // Wrong category first, then undo and re-post to the right one.
    await me.mutation(api.booksBank.post, { id: claude._id, categoryAccountId: s.ads, ruleText: "claude" });
    await me.mutation(api.booksBank.undo, { id: claude._id, date: "2026-11-05" });
    review = await me.query(api.booksBank.review, { accountId: s.card });
    expect(review.map((r) => r._id)).toEqual([claude._id]);
    expect(review[0].suggestedAccountId).toBe(s.ads); // the saved rule
    await me.mutation(api.booksBank.post, { id: claude._id, categoryAccountId: s.software });

    const b = await balances(me);
    expect(b.get("Business Chase Credit Card")).toBe(6860);
    const pl = await me.query(api.booksReports.profitAndLossReport, { from: "2026-01-01", to: "2026-12-31" });
    expect(pl.expenses.map((e) => [e.name, e.balance]).sort()).toEqual([
      ["Advertising & marketing", 4860],
      ["Office expenses:Software & apps", 2000],
    ]);
    // Bank-feed entries can only be undone from the Bank page.
    const posted = await me.query(api.booksBank.review, { accountId: s.card, status: "posted" });
    await expect(me.mutation(api.booksLedger.reverse, { entryId: posted[0].entryId!, date: "2026-11-06" })).rejects.toThrow(/Bank page/);
    expect(await me.query(api.booksBank.counts, {})).toEqual({});
  });

  it("a card payment posted from checking is matched, not double-counted, on the card side", async () => {
    const s = await setup();
    const { me } = s;
    await me.mutation(api.booksBank.importRows, {
      accountId: s.chk, rows: [{ date: "2026-10-24", description: "CHASE CREDIT CRD AUTOPAY", amount: -11660, hash: "c1" }],
    });
    const [out] = await me.query(api.booksBank.review, { accountId: s.chk });
    const entryId = await me.mutation(api.booksBank.post, { id: out._id, categoryAccountId: s.card });

    await me.mutation(api.booksBank.importRows, {
      accountId: s.card, rows: [{ date: "2026-10-26", description: "Payment Thank You-Mobile", amount: 11660, hash: "p1" }],
    });
    const [incoming] = await me.query(api.booksBank.review, { accountId: s.card });
    expect(incoming.matches.map((m) => m.entryId)).toEqual([entryId]);
    await me.mutation(api.booksBank.match, { id: incoming._id, entryId });

    const b = await balances(me);
    expect(b.get("Business Chase Credit Card")).toBe(-11660); // paid once, not twice
    expect(b.get("Chase Business Checking Account")).toBe(-11660);
    // But the same card row can't claim it twice.
    await me.mutation(api.booksBank.importRows, {
      accountId: s.card, rows: [{ date: "2026-10-26", description: "Payment Thank You-Mobile", amount: 11660, hash: "p2" }],
    });
    const [dup] = await me.query(api.booksBank.review, { accountId: s.card });
    expect(dup.matches).toEqual([]);
    await expect(me.mutation(api.booksBank.match, { id: dup._id, entryId })).rejects.toThrow(/already matched/);
    await me.mutation(api.booksBank.exclude, { id: dup._id });
    expect(await me.query(api.booksBank.counts, {})).toEqual({});
  });

  it("matches QuickBooks-imported history instead of posting it again", async () => {
    const s = await setup();
    const { me } = s;
    await me.mutation(api.booksImport.importEntries, {
      entries: [{
        date: "2026-10-07", txnType: "Expense", sourceRef: "qbo:561|2026-10-07|Expense",
        lines: [
          { accountName: "Office expenses:Software & apps", debit: 3800, credit: 0 },
          { accountName: "Business Chase Credit Card", debit: 0, credit: 3800 },
        ],
      }],
    });
    await me.mutation(api.booksBank.importRows, {
      accountId: s.card, rows: [{ date: "2026-10-07", description: "Intuit Quickbook", amount: -3800, hash: "q" }],
    });
    const [row] = await me.query(api.booksBank.review, { accountId: s.card });
    expect(row.matches).toHaveLength(1);
    await me.mutation(api.booksBank.match, { id: row._id, entryId: row.matches[0].entryId as Id<"booksEntries"> });
    const b = await balances(me);
    expect(b.get("Business Chase Credit Card")).toBe(3800);
  });
});

describe("reconciliation", () => {
  it("checks off a card statement, refuses to finish off-balance, locks cleared entries, carries the balance forward", async () => {
    const s = await setup();
    const { me } = s;
    const exp = (date: string, amount: number, isRefund = false) =>
      me.mutation(api.booksExpenses.create, { date, amount, isRefund, paidFromAccountId: s.card, categoryAccountId: s.software });
    const e1 = await exp("2026-11-03", 10000);
    await exp("2026-11-05", 2500, true); // refund lowers what's owed
    await exp("2026-11-28", 4000); // after the statement closes
    await me.mutation(api.booksLedger.post, {
      date: "2026-11-10",
      memo: "Card payment",
      lines: [{ accountId: s.card, debit: 5000, credit: 0 }, { accountId: s.chk, debit: 0, credit: 5000 }],
    });

    // Statement 1 closes 11/25 owing $25.00 (100 - 25 - 50).
    const recId = await me.mutation(api.booksReconcile.start, { accountId: s.card, statementDate: "2026-11-25", statementBalance: 2500 });
    await expect(me.mutation(api.booksReconcile.start, { accountId: s.card, statementDate: "2026-12-25", statementBalance: 0 }))
      .rejects.toThrow(/open reconciliation/);
    let cur = await me.query(api.booksReconcile.current, { accountId: s.card });
    expect(cur!.rows.map((r) => r.amount)).toEqual([10000, -2500, -5000]); // the 11/28 charge isn't offered
    expect(cur!.difference).toBe(2500);

    // Clear only the charge: off by the refund and payment.
    await me.mutation(api.booksReconcile.setCleared, { recId, lineIds: [cur!.rows[0].lineId], cleared: true });
    cur = await me.query(api.booksReconcile.current, { accountId: s.card });
    expect(cur!.difference).toBe(-7500);
    await expect(me.mutation(api.booksReconcile.finish, { recId })).rejects.toThrow(/\$0\.00/);

    await me.mutation(api.booksReconcile.setCleared, { recId, lineIds: cur!.rows.map((r) => r.lineId), cleared: true });
    cur = await me.query(api.booksReconcile.current, { accountId: s.card });
    expect(cur!.difference).toBe(0);
    await me.mutation(api.booksReconcile.finish, { recId });
    expect(await me.query(api.booksReconcile.current, { accountId: s.card })).toBeNull();

    // A cleared entry can't be reversed until the statement is reopened.
    await expect(me.mutation(api.booksLedger.reverse, { entryId: e1, date: "2026-12-01" })).rejects.toThrow(/reconciled statement/);

    // Statement 2 starts from $25.00 and only offers the uncleared 11/28 charge.
    await expect(me.mutation(api.booksReconcile.start, { accountId: s.card, statementDate: "2026-11-20", statementBalance: 0 }))
      .rejects.toThrow(/later date/);
    const rec2 = await me.mutation(api.booksReconcile.start, { accountId: s.card, statementDate: "2026-12-25", statementBalance: 6500 });
    cur = await me.query(api.booksReconcile.current, { accountId: s.card });
    expect(cur!.rec.beginningBalance).toBe(2500);
    expect(cur!.rows.map((r) => r.amount)).toEqual([4000]);
    // Can't reopen statement 1 while statement 2 is open, and can't clear statement 1's lines here.
    const list = await me.query(api.booksReconcile.list, { accountId: s.card });
    const first = list.find((r) => r.statementDate === "2026-11-25")!;
    await expect(me.mutation(api.booksReconcile.reopen, { recId: first._id })).rejects.toThrow(/open reconciliation/);
    const firstLines = await s.t.run((ctx) => ctx.db.query("booksLines").withIndex("by_rec", (q) => q.eq("recId", first._id)).collect());
    await expect(me.mutation(api.booksReconcile.setCleared, { recId: rec2, lineIds: [firstLines[0]._id], cleared: false }))
      .rejects.toThrow(/another statement/);

    // Cancel statement 2, reopen statement 1, then the reversal is allowed.
    await me.mutation(api.booksReconcile.cancel, { recId: rec2 });
    await me.mutation(api.booksReconcile.reopen, { recId: first._id });
    await me.mutation(api.booksReconcile.setCleared, { recId: first._id, lineIds: firstLines.map((l) => l._id), cleared: false });
    await me.mutation(api.booksLedger.reverse, { entryId: e1, date: "2026-12-01" });
    await balances(me);
  });

  it("works for checking in the money-you-have direction", async () => {
    const s = await setup();
    const { me } = s;
    await me.mutation(api.booksLedger.post, {
      date: "2026-11-01",
      memo: "Deposit",
      lines: [{ accountId: s.chk, debit: 20000, credit: 0 }, { accountId: s.services, debit: 0, credit: 20000 }],
    });
    await me.mutation(api.booksExpenses.create, { date: "2026-11-02", amount: 1500, paidFromAccountId: s.chk, categoryAccountId: s.ads });
    const recId = await me.mutation(api.booksReconcile.start, { accountId: s.chk, statementDate: "2026-11-30", statementBalance: 18500 });
    const cur = await me.query(api.booksReconcile.current, { accountId: s.chk });
    expect(cur!.rows.map((r) => r.amount)).toEqual([20000, -1500]);
    await me.mutation(api.booksReconcile.setCleared, { recId, lineIds: cur!.rows.map((r) => r.lineId), cleared: true });
    await me.mutation(api.booksReconcile.finish, { recId });
    const list = await me.query(api.booksReconcile.list, { accountId: s.chk });
    expect(list[0]).toMatchObject({ status: "done", cleared: 18500, difference: 0 });
    // Only a bank/card account can be reconciled.
    await expect(me.mutation(api.booksReconcile.start, { accountId: s.ads, statementDate: "2026-11-30", statementBalance: 0 }))
      .rejects.toThrow(/bank or card/);
  });
});

describe("contacts from QuickBooks", () => {
  it("creates customers and vendors from journal names, links old entries on re-import, fills in contact details", async () => {
    const s = await setup();
    const { me } = s;
    type E = { date: string; txnType: string; num?: string; sourceRef: string; lines: { accountName: string; debit: number; credit: number; name?: string }[] };
    const inv: E = {
      date: "2025-03-01", txnType: "Invoice", num: "1010", sourceRef: "qbo:900|2025-03-01|Invoice",
      lines: [
        { accountName: "Accounts Receivable (A/R)", debit: 50000, credit: 0, name: "Sam Carter" },
        { accountName: "Services", debit: 0, credit: 50000, name: "Sam Carter" },
      ],
    };
    const dep: E = {
      date: "2025-03-05", txnType: "Deposit", sourceRef: "qbo:901|2025-03-05|Deposit",
      lines: [
        { accountName: "Chase Business Checking Account", debit: 50000, credit: 0 },
        { accountName: "Accounts Receivable (A/R)", debit: 0, credit: 50000, name: "sam carter" },
      ],
    };
    const exp: E = {
      date: "2025-03-07", txnType: "Credit Card Expense", sourceRef: "qbo:902|2025-03-07|Credit Card Expense",
      lines: [
        { accountName: "Advertising & marketing", debit: 4860, credit: 0, name: "Upwork Global LLC" },
        { accountName: "Business Chase Credit Card", debit: 0, credit: 4860 },
      ],
    };
    // First import without names (like the original migration), then again with names.
    const strip = (e: E) => ({ ...e, lines: e.lines.map(({ name: _n, ...l }) => l) });
    await me.mutation(api.booksImport.importEntries, { entries: [strip(inv), strip(dep), strip(exp)] });
    expect(await me.query(api.booksContacts.summary, {})).toHaveLength(0);
    const r = await me.mutation(api.booksImport.importEntries, { entries: [inv, dep, exp] });
    expect(r).toMatchObject({ posted: 0, skipped: 3, linked: 4, created: 2 });
    // Running it again changes nothing.
    expect(await me.mutation(api.booksImport.importEntries, { entries: [inv, dep, exp] })).toMatchObject({ linked: 0, created: 0 });

    let all = await me.query(api.booksContacts.summary, {});
    const sam = all.find((c) => c.name === "Sam Carter")!;
    expect(sam).toMatchObject({ kind: "customer", earned: 50000, owed: 0, transactions: 2, lastDate: "2025-03-05" });
    expect(all.find((c) => c.name === "Upwork Global LLC")).toMatchObject({ kind: "vendor", spent: 4860 });

    // Contact list: fills blanks on Sam, adds a customer with no transactions, keeps a hand-entered email.
    await me.mutation(api.booksContacts.update, { id: sam._id, email: "sam@mine.com" });
    const c = await me.mutation(api.booksImport.importContacts, {
      contacts: [
        { name: "Sam Carter", kind: "customer", email: "sam@qbo.com", phone: "(215) 555-0101" },
        { name: "Pat Rivera", kind: "customer", email: "mike@example.com" },
      ],
    });
    expect(c).toEqual({ created: 1, updated: 1 });
    all = await me.query(api.booksContacts.summary, {});
    expect(all.find((x) => x.name === "Sam Carter")).toMatchObject({ email: "sam@mine.com", phone: "(215) 555-0101" });
    expect(all.find((x) => x.name === "Pat Rivera")).toMatchObject({ kind: "customer", transactions: 0 });

    const act = await me.query(api.booksContacts.activity, { id: sam._id });
    expect(act.rows.map((x) => x.txnType)).toEqual(["Deposit", "Invoice"]);
    await balances(me);
  });
});

describe("tax", () => {
  it("Schedule C, mileage, estimates and 1099s from the books", async () => {
    const s = await setup();
    const { me } = s;
    const contractor = await me.mutation(api.booksContacts.create, { name: "Dana Lee", kind: "contractor" });
    const accts = await me.query(api.booksAccounts.list, {});
    const find = async (name: string, type: "expense" | "equity") =>
      accts.find((a) => a.name === name)?._id ?? (await me.mutation(api.booksAccounts.create, { name, type }));
    const labor = await find("Contract labor", "expense");
    const fedEst = await find("Federal estimated taxes", "equity");
    await me.mutation(api.booksLedger.post, {
      date: "2026-02-01", memo: "Client paid",
      lines: [{ accountId: s.chk, debit: 1000000, credit: 0 }, { accountId: s.services, debit: 0, credit: 1000000 }],
    });
    // Contractor: $2,500 by bank (reportable) and $300 by card (not reportable).
    await me.mutation(api.booksExpenses.create, { date: "2026-03-01", amount: 250000, paidFromAccountId: s.chk, categoryAccountId: labor, contactId: contractor });
    await me.mutation(api.booksExpenses.create, { date: "2026-03-02", amount: 30000, paidFromAccountId: s.card, categoryAccountId: labor, contactId: contractor });
    await me.mutation(api.booksExpenses.create, { date: "2026-03-03", amount: 10000, paidFromAccountId: s.card, categoryAccountId: s.software });
    await me.mutation(api.booksLedger.post, {
      date: "2026-04-14", memo: "IRS 1040-ES Q1",
      lines: [{ accountId: fedEst, debit: 50000, credit: 0 }, { accountId: s.chk, debit: 0, credit: 50000 }],
    });
    await me.mutation(api.booksTax.addMileage, { date: "2026-07-10", miles: 100, purpose: "Client site visit" });
    await expect(me.mutation(api.booksTax.addMileage, { date: "2026-07-10", miles: 5, purpose: " " })).rejects.toThrow(/purpose/);

    const sc = await me.query(api.booksTax.scheduleCReport, { year: 2026 });
    const by = Object.fromEntries(sc.lines.map((l) => [l.code, l.amount]));
    expect(by).toMatchObject({ "1": 1000000, "9": 7600, "11": 280000, "18": 10000 });
    expect(sc.netProfit).toBe(1000000 - 7600 - 280000 - 10000);

    // Re-map software to "Other expenses" by hand.
    await me.mutation(api.booksTax.setScheduleCLine, { accountId: s.software, line: "27a" });
    const sc2 = await me.query(api.booksTax.scheduleCReport, { year: 2026 });
    expect(sc2.lines.find((l) => l.code === "27a")?.amount).toBe(10000);
    expect(sc2.mapping.find((m) => m._id === s.software)).toMatchObject({ line: "27a", guessed: false });

    const est = await me.query(api.booksTax.estimates, { year: 2026, asOf: "2026-12-31" });
    expect(est.netProfit).toBe(702400);
    expect(est.federalPaid).toBe(50000);
    expect(est.selfEmployment.total).toBeGreaterThan(0);

    const f = await me.query(api.booksTax.form1099, { year: 2026 });
    expect(f.threshold).toBe(200000);
    expect(f.rows.find((r) => r.name === "Dana Lee")).toMatchObject({ bank: 250000, card: 30000, reportable: 250000, needs1099: true });
    await balances(me);
  });
});

describe("invoice links and Stripe", () => {
  async function sentInvoice(s: Awaited<ReturnType<typeof setup>>) {
    const { me } = s;
    const customer = await me.mutation(api.booksContacts.create, { name: "Pat Rivera", kind: "customer", email: "mike@example.com" });
    const id = await me.mutation(api.booksInvoices.saveDraft, {
      number: "2001", contactId: customer, issueDate: "2026-11-01", dueDate: "2026-11-15",
      lines: [{ description: "Website care", quantity: 1, rate: 22500, accountId: s.services }],
    });
    return { id, customer };
  }

  it("a public link shows only that invoice, and can be turned off", async () => {
    const s = await setup();
    const { me, t } = s;
    const { id } = await sentInvoice(s);
    await expect(me.mutation(api.booksInvoices.shareLink, { id })).rejects.toThrow(/sent first/);
    await me.mutation(api.booksInvoices.send, { id });
    const token = await me.mutation(api.booksInvoices.shareLink, { id });
    expect(token).toMatch(/^[0-9a-f]{48}$/);
    expect(await me.mutation(api.booksInvoices.shareLink, { id })).toBe(token); // stable

    const pub = await t.query(api.booksPublic.invoice, { token }); // no sign-in
    expect(pub).toMatchObject({ number: "2001", balance: 22500, customer: { name: "Pat Rivera" }, payOnline: false });
    expect(JSON.stringify(pub)).not.toContain("mike@example.com"); // no contact details beyond the bill-to
    expect(await t.query(api.booksPublic.invoice, { token: "0".repeat(48) })).toBeNull();
    expect(await t.query(api.booksPublic.invoice, { token: "bad" })).toBeNull();
    // Strangers can't make links.
    await expect(t.mutation(api.booksInvoices.shareLink, { id })).rejects.toThrow(/access/);

    await me.mutation(api.booksInvoices.revokeLink, { id });
    expect(await t.query(api.booksPublic.invoice, { token })).toBeNull();
  });

  it("records a Stripe payment once, with the fee, into Stripe balance", async () => {
    const s = await setup();
    const { me, t } = s;
    const { id } = await sentInvoice(s);
    await me.mutation(api.booksInvoices.send, { id });
    const pay = { invoiceId: id as string, sessionId: "cs_test_1", amount: 22500, fee: 683, date: "2026-11-03" };
    expect(await t.mutation(internal.booksPublic.recordStripePayment, pay)).toEqual({ recorded: true, applied: 22500, unapplied: 0 });
    expect(await t.mutation(internal.booksPublic.recordStripePayment, pay)).toMatchObject({ recorded: false }); // webhook retry
    const inv = await me.query(api.booksInvoices.get, { id });
    expect(inv).toMatchObject({ status: "paid", amountPaid: 22500 });
    expect(inv!.payments[0]).toMatchObject({ method: "Stripe", fee: 683, externalId: "cs_test_1" });
    const b = await balances(me);
    expect(b.get("Stripe balance")).toBe(22500 - 683);
    expect(b.get("Accounts Receivable (A/R)")).toBe(0);
    const rules = await me.query(api.booksBank.listRules, {});
    expect(rules.map((r) => r.contains)).toContain("stripe");
    // Paid twice (second Checkout session): the money is still recorded, as an unapplied credit.
    expect(await t.mutation(internal.booksPublic.recordStripePayment, { ...pay, sessionId: "cs_test_2" }))
      .toEqual({ recorded: true, applied: 0, unapplied: 22500 });
    expect(await t.mutation(internal.booksPublic.recordStripePayment, { ...pay, sessionId: "cs_test_2" })).toMatchObject({ recorded: false });
    const b2 = await balances(me);
    expect(b2.get("Stripe balance")).toBe(2 * (22500 - 683));
    expect(b2.get("Customer credits (unapplied)")).toBe(22500);
    // Overpaid by less than Stripe's fee: fee goes on the invoice part, the extra $1 is a credit.
    const id2 = await me.mutation(api.booksInvoices.saveDraft, {
      number: "2002", contactId: inv!.contactId, issueDate: "2026-11-02", dueDate: "2026-11-16",
      lines: [{ description: "Website care", quantity: 1, rate: 22500, accountId: s.services }],
    });
    await me.mutation(api.booksInvoices.send, { id: id2 });
    expect(await t.mutation(internal.booksPublic.recordStripePayment, { invoiceId: id2 as string, sessionId: "cs_test_3", amount: 22600, fee: 685, date: "2026-11-04" }))
      .toEqual({ recorded: true, applied: 22500, unapplied: 100 });
    await balances(me);
    const todo = await me.query(api.booksReports.todo, { today: "2026-11-05" });
    expect(todo.map((x) => x.text).join(" ")).toMatch(/\$226\.00 of customer payments isn't applied/);
  });

  it("verifies Stripe webhook signatures", async () => {
    const { verifyStripeSignature } = await import("./booksStripe");
    const secret = "whsec_test";
    const body = '{"id":"evt_1"}';
    const t = 1_800_000_000;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${body}`)));
    const sig = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
    expect(await verifyStripeSignature(body, `t=${t},v1=${sig}`, secret, t + 10)).toBe(true);
    expect(await verifyStripeSignature(body + " ", `t=${t},v1=${sig}`, secret, t + 10)).toBe(false); // tampered
    expect(await verifyStripeSignature(body, `t=${t},v1=${sig}`, secret, t + 1000)).toBe(false); // too old
    expect(await verifyStripeSignature(body, null, secret, t)).toBe(false);
  });
});

describe("recurring invoices", () => {
  it("creates and posts invoices on schedule, catches up, numbers them, and stops at the end date", async () => {
    const s = await setup();
    const { me, t } = s;
    const mike = await me.mutation(api.booksContacts.create, { name: "Pat Rivera", kind: "customer", email: "mike@example.com" });
    await expect(me.mutation(api.booksRecurring.create, {
      contactId: mike, lines: [{ description: "Care", quantity: 1, rate: 22500, accountId: s.software }],
      everyMonths: 1, dayOfMonth: 21, termsDays: 14, startDate: "2026-09-21", autoEmail: false,
    })).rejects.toThrow(/income account/);
    const id = await me.mutation(api.booksRecurring.create, {
      contactId: mike, lines: [{ description: "Website care plan", quantity: 1, rate: 22500, accountId: s.services }],
      everyMonths: 1, dayOfMonth: 21, termsDays: 14, startDate: "2026-09-21", endDate: "2026-12-31", autoEmail: true,
    });
    // Two months behind on Nov 1: makes Sep 21 and Oct 21.
    const toEmail = await t.mutation(internal.booksRecurring.createDue, { today: "2026-11-01" });
    expect(toEmail).toHaveLength(2);
    let invs = await me.query(api.booksInvoices.list, {});
    expect(invs.map((i) => [i.number, i.issueDate, i.dueDate, i.status]).sort()).toEqual([
      ["1001", "2026-09-21", "2026-10-05", "sent"],
      ["1002", "2026-10-21", "2026-11-04", "sent"],
    ]);
    // Same day again: nothing new.
    expect(await t.mutation(internal.booksRecurring.createDue, { today: "2026-11-01" })).toHaveLength(0);
    let [r] = await me.query(api.booksRecurring.list, {});
    expect(r).toMatchObject({ nextDate: "2026-11-21", active: true, total: 22500 });
    // Pause skips it. Resuming on Dec 10 starts at Dec 21 instead of back-billing Nov.
    await me.mutation(api.booksRecurring.update, { id, active: false });
    expect(await t.mutation(internal.booksRecurring.createDue, { today: "2026-12-09" })).toHaveLength(0);
    await me.mutation(api.booksRecurring.update, { id, active: true, today: "2026-12-10" });
    [r] = await me.query(api.booksRecurring.list, {});
    expect(r.nextDate).toBe("2026-12-21");
    // Run through year end: Dec only, then it ends.
    expect(await t.mutation(internal.booksRecurring.createDue, { today: "2027-02-01" })).toHaveLength(1);
    [r] = await me.query(api.booksRecurring.list, {});
    expect(r).toMatchObject({ active: false, nextDate: "2027-01-21" });
    invs = await me.query(api.booksInvoices.list, {});
    expect(invs).toHaveLength(3);
    // A past next date is moved forward unless back-billing is asked for.
    await me.mutation(api.booksRecurring.update, { id, active: true, endDate: "2027-12-31", today: "2027-03-01" });
    await me.mutation(api.booksRecurring.update, { id, nextDate: "2027-01-21", today: "2027-03-01" });
    [r] = await me.query(api.booksRecurring.list, {});
    expect(r.nextDate).toBe("2027-03-21");
    await me.mutation(api.booksRecurring.update, { id, nextDate: "2027-01-21", today: "2027-03-01", allowBackfill: true });
    [r] = await me.query(api.booksRecurring.list, {});
    expect(r.nextDate).toBe("2027-01-21");
    const b = await balances(me);
    expect(b.get("Accounts Receivable (A/R)")).toBe(67500);
  });
});

describe("exports", () => {
  it("general ledger, P&L by month, and an owner-only backup", async () => {
    const s = await setup();
    const { me, t } = s;
    const c = await me.mutation(api.booksContacts.create, { name: "Pat Rivera", kind: "customer" });
    await me.mutation(api.booksLedger.post, {
      date: "2026-03-05", memo: "Deposit",
      lines: [{ accountId: s.chk, debit: 50000, credit: 0 }, { accountId: s.services, debit: 0, credit: 50000, contactId: c }],
    });
    await me.mutation(api.booksExpenses.create, { date: "2026-04-02", amount: 2000, paidFromAccountId: s.card, categoryAccountId: s.software });
    const gl = await me.query(api.booksExport.generalLedger, { from: "2026-01-01", to: "2026-12-31" });
    expect(gl).toHaveLength(4);
    expect(gl[1]).toMatchObject({ date: "2026-03-05", account: "Services", contact: "Pat Rivera", credit: 50000 });
    const m = await me.query(api.booksExport.profitAndLossByMonth, { year: 2026 });
    expect(m.totals.income[2]).toBe(50000);
    expect(m.totals.expenses[3]).toBe(2000);
    expect(m.totals.net.reduce((a, b) => a + b, 0)).toBe(48000);
    const b = await me.query(api.booksExport.backup, {});
    expect(b.format).toBe("sira-books-backup-v1");
    expect(b.lines).toHaveLength(4);
    expect(b.members[0]).not.toHaveProperty("userId");
    // Invited members can't take a backup.
    await me.mutation(api.booksAuth.invite, { email: "cpa@firm.com" });
    await t.mutation(internal.booksAuth.bindMember, { userId: "user_cpa", email: "cpa@firm.com" });
    const cpa = t.withIdentity({ subject: "user_cpa", issuer: "https://api.workos.com/" });
    await expect(cpa.query(api.booksExport.backup, {})).rejects.toThrow(/owner/);
    expect(await cpa.query(api.booksExport.generalLedger, { from: "2026-01-01", to: "2026-12-31" })).toHaveLength(4);
  });
});

describe("overview to-do", () => {
  it("flags stale reconciliations, upcoming estimates and missing receipts", async () => {
    const s = await setup();
    const { me } = s;
    await me.mutation(api.booksExpenses.create, { date: "2026-08-10", amount: 12000, paidFromAccountId: s.card, categoryAccountId: s.software });
    await me.mutation(api.booksExpenses.create, { date: "2026-08-11", amount: 1000, paidFromAccountId: s.card, categoryAccountId: s.software }); // under $75
    const rec = await me.mutation(api.booksReconcile.start, { accountId: s.card, statementDate: "2026-07-25", statementBalance: 0 });
    await me.mutation(api.booksReconcile.finish, { recId: rec });
    const todo = await me.query(api.booksReports.todo, { today: "2026-09-10" });
    const text = todo.map((t) => t.text).join(" | ");
    expect(text).toMatch(/Business Chase Credit Card: last reconciled through 2026-07-25/);
    expect(text).toMatch(/Estimated tax payment due 2026-09-15 \(5 days\)/);
    expect(text).toMatch(/1 expense of \$75\+ .* no receipt/);
    expect(todo[0].level).toBe("warn");
  });
});

describe("search, splits and credits", () => {
  it("finds entries by text, account, contact and amount", async () => {
    const s = await setup();
    const { me } = s;
    const v = await me.mutation(api.booksContacts.create, { name: "Upwork Global LLC", kind: "vendor" });
    await me.mutation(api.booksExpenses.create, { date: "2026-10-07", payee: "Upwork", amount: 4860, paidFromAccountId: s.card, categoryAccountId: s.ads, contactId: v });
    await me.mutation(api.booksExpenses.create, { date: "2026-10-08", payee: "Anthropic", amount: 2000, paidFromAccountId: s.card, categoryAccountId: s.software });
    const r = { from: "2026-01-01", to: "2026-12-31" };
    expect(await me.query(api.booksLedger.search, { ...r, text: "upwork" })).toHaveLength(1);
    expect(await me.query(api.booksLedger.search, { ...r, accountId: s.software })).toHaveLength(1);
    expect(await me.query(api.booksLedger.search, { ...r, contactId: v })).toHaveLength(1);
    expect(await me.query(api.booksLedger.search, { ...r, amount: 2000 })).toHaveLength(1);
    expect(await me.query(api.booksLedger.search, { ...r, accountId: s.card })).toHaveLength(2);
    expect(await me.query(api.booksLedger.search, { ...r, text: "nothing like this" })).toHaveLength(0);
  });

  it("posts a bank row split across categories, and checks the parts add up", async () => {
    const s = await setup();
    const { me } = s;
    const draws = await me.mutation(api.booksAccounts.create, { name: "Owner draws (test)", type: "equity" });
    await me.mutation(api.booksBank.importRows, { accountId: s.card, rows: [{ date: "2026-11-02", description: "COSTCO", amount: -15000, hash: "c" }] });
    const [row] = await me.query(api.booksBank.review, { accountId: s.card });
    await expect(me.mutation(api.booksBank.postSplit, { id: row._id, splits: [
      { categoryAccountId: s.software, amount: 10000 }, { categoryAccountId: draws, amount: 4000 },
    ] })).rejects.toThrow(/add up to 140\.00/);
    await me.mutation(api.booksBank.postSplit, { id: row._id, splits: [
      { categoryAccountId: s.software, amount: 10000 }, { categoryAccountId: draws, amount: 5000, memo: "personal" },
    ] });
    const b = await balances(me);
    expect(b.get("Business Chase Credit Card")).toBe(15000);
    expect(b.get("Owner draws (test)")).toBe(-5000);
    const pl = await me.query(api.booksReports.profitAndLossReport, { from: "2026-01-01", to: "2026-12-31" });
    expect(pl.totalExpenses).toBe(10000);
  });

  it("applies a customer's unapplied credit to an invoice", async () => {
    const s = await setup();
    const { me, t } = s;
    const c = await me.mutation(api.booksContacts.create, { name: "Pat Rivera", kind: "customer" });
    const mk = async (number: string) => {
      const id = await me.mutation(api.booksInvoices.saveDraft, {
        number, contactId: c, issueDate: "2026-11-01", dueDate: "2026-11-15",
        lines: [{ description: "Care", quantity: 1, rate: 22500, accountId: s.services }],
      });
      await me.mutation(api.booksInvoices.send, { id });
      return id;
    };
    const a = await mk("3001");
    const pay = { invoiceId: a as string, amount: 22500, fee: 0, date: "2026-11-02" };
    await t.mutation(internal.booksPublic.recordStripePayment, { ...pay, sessionId: "cs_a" });
    await t.mutation(internal.booksPublic.recordStripePayment, { ...pay, sessionId: "cs_b" }); // paid twice
    expect(await me.query(api.booksInvoices.creditFor, { contactId: c })).toBe(22500);
    const b = await mk("3002");
    await expect(me.mutation(api.booksInvoices.applyCredit, { invoiceId: b, amount: 30000, date: "2026-12-01" })).rejects.toThrow(/more than/);
    await me.mutation(api.booksInvoices.applyCredit, { invoiceId: b, amount: 22500, date: "2026-12-01" });
    expect(await me.query(api.booksInvoices.get, { id: b })).toMatchObject({ status: "paid" });
    expect(await me.query(api.booksInvoices.creditFor, { contactId: c })).toBe(0);
    const bal = await balances(me);
    expect(bal.get("Customer credits (unapplied)")).toBe(0);
    expect(bal.get("Accounts Receivable (A/R)")).toBe(0);
    // Voiding gives the credit back.
    await me.mutation(api.booksInvoices.voidInvoice, { id: b, date: "2026-12-02" });
    expect(await me.query(api.booksInvoices.creditFor, { contactId: c })).toBe(22500);
  });
});
