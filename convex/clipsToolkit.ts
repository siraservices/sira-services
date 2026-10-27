import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const TOOLKIT_SOURCE = "clips-toolkit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** URL-safe random token (no crypto.randomUUID dependency in the Convex runtime). */
function newToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Lead-magnet signup for the free Sira Clips toolkit. Saves the lead and emails
 * a private download link. Re-requests from the same email reuse the existing
 * token instead of creating duplicate leads.
 */
export const request = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    decisionRole: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    videoVolume: v.optional(v.string()),
    wantsInstall: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 120);
    const email = args.email.trim().toLowerCase().slice(0, 200);
    if (!name) throw new Error("Name is required");
    if (!EMAIL_RE.test(email)) throw new Error("A valid email is required");

    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("source"), TOOLKIT_SOURCE))
      .first();

    // Wants Sira to install or run it = a sales conversation.
    const qualificationTier =
      args.wantsInstall && args.wantsInstall !== "diy" ? "qualified" : "nurture";

    let token: string;
    let isRepeat = false;
    if (existing && existing.downloadToken) {
      token = existing.downloadToken;
      isRepeat = true;
      // Throttle resends: at most one email per 2 minutes per address.
      if (Date.now() - existing.createdAt < 2 * 60 * 1000) return { ok: true };
      await ctx.db.patch(existing._id, {
        wantsInstall: args.wantsInstall ?? existing.wantsInstall,
        qualificationTier:
          existing.qualificationTier === "qualified" ? "qualified" : qualificationTier,
      });
    } else {
      token = newToken();
      const summary = [
        "Requested the free Sira Clips toolkit.",
        args.wantsInstall ? `Wants: ${args.wantsInstall}` : null,
        args.videoVolume ? `Long videos/month: ${args.videoVolume}` : null,
        args.teamSize ? `Team size: ${args.teamSize}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      await ctx.db.insert("leads", {
        name,
        email,
        company: args.company?.trim().slice(0, 160) || undefined,
        decisionRole: args.decisionRole,
        teamSize: args.teamSize,
        videoVolume: args.videoVolume,
        wantsInstall: args.wantsInstall,
        message: summary,
        source: TOOLKIT_SOURCE,
        serviceInterest: "Sira Clips (video repurposing)",
        qualificationTier,
        downloadToken: token,
        downloadCount: 0,
        status: "new",
        createdAt: Date.now(),
      });
    }

    await ctx.scheduler.runAfter(0, internal.email.sendToolkitEmails, {
      name,
      email,
      token,
      company: args.company,
      decisionRole: args.decisionRole,
      teamSize: args.teamSize,
      videoVolume: args.videoVolume,
      wantsInstall: args.wantsInstall,
      isRepeat,
    });

    return { ok: true };
  },
});

/**
 * Called by the download route: validates the token and counts the download so the
 * admin can see who actually grabbed the toolkit. Returns false for unknown tokens.
 */
export const recordDownload = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (token.length < 32) return false;
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_downloadToken", (q) => q.eq("downloadToken", token))
      .first();
    if (!lead) return false;
    await ctx.db.patch(lead._id, {
      downloadCount: (lead.downloadCount ?? 0) + 1,
      lastDownloadAt: Date.now(),
    });
    return true;
  },
});
