import { NextResponse } from "next/server";
import {
  decodeDocument,
  MAX_SERVER_SHARE_BYTES,
} from "@/lib/share/share-document";
import {
  isShareStoreConfigured,
  storeShareDocument,
} from "@/lib/share/share-blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stores a view-only design snapshot and returns a short id. The body is the design's encoded payload (text). */
export async function GET(): Promise<Response> {
  return NextResponse.json({ configured: isShareStoreConfigured() });
}

export async function POST(request: Request): Promise<Response> {
  if (!isShareStoreConfigured())
    return NextResponse.json({ configured: false }, { status: 501 });

  const encoded = (await request.text()).trim();
  if (!encoded || encoded.length > MAX_SERVER_SHARE_BYTES)
    return NextResponse.json(
      { error: "This design is too large to share with a short link." },
      { status: 413 },
    );

  // Validate the payload is a real design before storing it, so the store only ever holds openable snapshots.
  try {
    decodeDocument(encoded);
  } catch {
    return NextResponse.json(
      { error: "This design could not be read." },
      { status: 400 },
    );
  }

  try {
    const id = await storeShareDocument(encoded);
    if (!id) return NextResponse.json({ configured: false }, { status: 501 });
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[/api/share] Vercel Blob put() failed:", err);
    return NextResponse.json(
      { error: "The share link could not be created." },
      { status: 500 },
    );
  }
}
