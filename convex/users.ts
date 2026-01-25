import { query } from "./_generated/server";
import { auth } from "./auth.config";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (user === null) {
      return null;
    }
    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
    };
  },
});
