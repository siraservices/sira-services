import { withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Sync user with Convex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = await convex.mutation((api as any).users.getOrCreateUser, {
      workosId: user.id,
      email: user.email || "",
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      profilePictureUrl: user.profilePictureUrl || undefined,
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
