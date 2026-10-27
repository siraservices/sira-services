import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZIP_NAME = "sira-clips-toolkit.zip";

/**
 * Gated download for the Sira Clips lead magnet. The emailed link carries a
 * per-lead token; valid tokens get the zip (and the download is counted),
 * anything else goes back to the signup form.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const back = new URL("/clips?link=invalid#get", req.nextUrl.origin);
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return NextResponse.redirect(back);
  }

  let ok = false;
  try {
    ok = await convexServer.mutation(api.clipsToolkit.recordDownload, { token });
  } catch (err) {
    console.error("[clips/download] Convex error:", err);
    return new NextResponse("Download is temporarily unavailable. Please try again in a minute.", {
      status: 503,
    });
  }
  if (!ok) return NextResponse.redirect(back);

  const file = await readFile(path.join(process.cwd(), "downloads", ZIP_NAME));
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${ZIP_NAME}"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
