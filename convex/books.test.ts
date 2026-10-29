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
    expect(await t.mutation(internal.booksAuth.bindMember, { userId: "user_x", email: "julioaira4@gmail.com" })).toEqual({
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
    const jesse = await me.mutation(api.booksContacts.create, { name: "Jesse", kind: "customer", email: "j@x.com" });
    expect(await me.query(api.booksInvoices.nextNumber, {})).toBe("1001");

    const id = await me.mutation(api.booksInvoices.saveDraft, {
      number: "1001",
      contactId: jesse,
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
        number: "1001", contactId: jesse, issueDate: "2026-11-01", dueDate: "2026-11-02",
        lines: [{ description: "x", quantity: 1, rate: 1, accountId: s.services }],
      }),
    ).rejects.toThrow(/already exists/);
    await expect(
      me.mutation(api.booksInvoices.saveDraft, {
        id, number: "1001", contactId: jesse, issueDate: "2026-11-01", dueDate: "2026-11-02",
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
      { date: "2026-11-01", description: "BT UPWORK 9574548", amount: -4860, hash: "a" },
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
