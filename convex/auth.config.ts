import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const auth = convexAuth({
  providers: [Google],
});
