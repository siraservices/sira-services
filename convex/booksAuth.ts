// Access control for Sira Books.
//
// Rule (Julio, 2026-10-28): only Julio, signed in as aira4development@gmail.com,
// can open Books. Nobody else gets in unless he invites them.
//
// How it is enforced, on the server, for every Books query and mutation:
//   1. The caller must present a valid WorkOS access token (Convex verifies it,
//      see auth.config.ts).
//   2. Their WorkOS user ID must be bound to an active row in booksMembers.
//   3. A user ID is only bound after we ask the WorkOS API for that user and it
//      says the email is verified and matches the owner (or an invited email).
// Anything else is denied. There is no sign-up path into Books.

import { ConvexError, v } from "convex/values";
import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { decideBind, normEmail } from "./booksLib";

type Ctx = QueryCtx | MutationCtx;

async function findMember(ctx: Ctx): Promise<Doc<"booksMembers"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const member = await ctx.db
    .query("booksMembers")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();
  return member && member.active ? member : null;
}

/** Throws unless the caller is an active Books member (or the owner). */
export async function requireBooksMember(
  ctx: Ctx,
  opts: { owner?: boolean } = {},
): Promise<Doc<"booksMembers">> {
  const member = await findMember(ctx);
  if (!member) throw new ConvexError("You don't have access to Sira Books.");
  if (opts.owner && member.role !== "owner") {
    throw new ConvexError("Only the owner can do that.");
  }
  return member;
}

export async function audit(ctx: MutationCtx, actor: string, action: string, detail?: string) {
  await ctx.db.insert("booksAudit", { at: Date.now(), actor, action, detail });
}

/** For the UI gate. Never throws, never reveals anything but the caller's own status. */
export const access = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { signedIn: false, allowed: false } as const;
    const member = await findMember(ctx);
    return member
      ? ({ signedIn: true, allowed: true, role: member.role, email: member.email } as const)
      : ({ signedIn: true, allowed: false } as const);
  },
});

/**
 * Bind the signed-in WorkOS user to their Books membership. Looks the user up
 * through the WorkOS API (server-side, with WORKOS_API_KEY) so the email and
 * its verification come from WorkOS, not from the browser.
 */
export const bindSelf = action({
  args: {},
  handler: async (ctx): Promise<{ allowed: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { allowed: false };
    const apiKey = process.env.WORKOS_API_KEY;
    if (!apiKey) throw new ConvexError("WORKOS_API_KEY is not set in Convex.");
    const res = await fetch(
      `https://api.workos.com/user_management/users/${encodeURIComponent(identity.subject)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    if (!res.ok) return { allowed: false };
    const user = (await res.json()) as { id: string; email: string; email_verified: boolean };
    if (user.id !== identity.subject || !user.email_verified) return { allowed: false };
    return await ctx.runMutation(internal.booksAuth.bindMember, {
      userId: user.id,
      email: user.email,
    });
  },
});

export const bindMember = internalMutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    const e = normEmail(email);
    const already = await ctx.db
      .query("booksMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (already) return { allowed: already.active };

    const row = await ctx.db
      .query("booksMembers")
      .withIndex("by_email", (q) => q.eq("email", e))
      .unique();

    const decision = decideBind(row, e, userId);
    if (decision === "deny") {
      await audit(ctx, e, "access.denied", userId);
      return { allowed: false };
    }
    if (decision === "create-owner") {
      // First verified sign-in by the owner creates the owner row.
      await ctx.db.insert("booksMembers", {
        email: e,
        role: "owner",
        userId,
        active: true,
        createdAt: Date.now(),
      });
    } else if (decision === "bind" && row) {
      await ctx.db.patch(row._id, { userId });
    }
    await audit(ctx, e, "access.bound", userId);
    return { allowed: true };
  },
});

export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx, { owner: true });
    return await ctx.db.query("booksMembers").collect();
  },
});

/** Owner-only: let someone else in (e.g. a CPA). */
export const invite = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const owner = await requireBooksMember(ctx, { owner: true });
    const e = normEmail(email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new ConvexError("That email doesn't look right.");
    const existing = await ctx.db
      .query("booksMembers")
      .withIndex("by_email", (q) => q.eq("email", e))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { active: true });
    } else {
      await ctx.db.insert("booksMembers", {
        email: e,
        role: "member",
        active: true,
        invitedBy: owner.email,
        createdAt: Date.now(),
      });
    }
    await audit(ctx, owner.email, "member.invite", e);
  },
});

/** Owner-only: remove someone's access. The owner can't remove himself. */
export const revoke = mutation({
  args: { id: v.id("booksMembers") },
  handler: async (ctx, { id }) => {
    const owner = await requireBooksMember(ctx, { owner: true });
    const row = await ctx.db.get(id);
    if (!row) return;
    if (row.role === "owner") throw new ConvexError("The owner can't be removed.");
    await ctx.db.patch(id, { active: false });
    await audit(ctx, owner.email, "member.revoke", row.email);
  },
});

/** Recent activity (who changed what), newest first. Owner only. */
export const auditLog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireBooksMember(ctx, { owner: true });
    return await ctx.db.query("booksAudit").withIndex("by_at").order("desc").take(Math.min(limit ?? 100, 500));
  },
});
