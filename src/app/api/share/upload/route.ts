import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isShareStoreConfigured } from "@/lib/share/share-blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHARE_PATH = /^shares\/[a-f0-9]{32}\.txt$/;
const MAX_CLIENT_SHARE_BYTES = 32 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function uploadPath(body: unknown): string | null {
  if (!isRecord(body) || !isRecord(body.payload)) return null;
  if (
    body.type === "blob.generate-client-token" &&
    typeof body.payload.pathname === "string"
  )
    return body.payload.pathname;
  if (
    body.type === "blob.upload-completed" &&
    isRecord(body.payload.blob) &&
    typeof body.payload.blob.pathname === "string"
  )
    return body.payload.blob.pathname;
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!isShareStoreConfigured() || !token)
    return NextResponse.json({ configured: false }, { status: 501 });

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  const pathname = uploadPath(parsedBody);
  if (!pathname || !SHARE_PATH.test(pathname))
    return NextResponse.json(
      { error: "Invalid share upload path." },
      { status: 400 },
    );

  try {
    const result = await handleUpload({
      token,
      request,
      body: parsedBody as HandleUploadBody,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["text/plain"],
        maximumSizeInBytes: MAX_CLIENT_SHARE_BYTES,
        addRandomSuffix: false,
        allowOverwrite: false,
        validUntil: Date.now() + 60 * 60 * 1000,
      }),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "[/api/share/upload] Vercel Blob client upload failed:",
      error,
    );
    return NextResponse.json(
      { error: "The share link could not be created." },
      { status: 500 },
    );
  }
}
