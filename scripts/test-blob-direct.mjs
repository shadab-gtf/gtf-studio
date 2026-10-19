/**
 * Direct Vercel Blob connectivity test — bypasses the Next.js API route.
 * Reads BLOB_READ_WRITE_TOKEN from .env.local directly and calls put() + head().
 *
 * Usage:
 *   node scripts/test-blob-direct.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── 1. Load .env.local manually (no Next.js runtime here) ────────────────────

const envPath = resolve(process.cwd(), ".env.local");
let envContent = "";
try {
  envContent = readFileSync(envPath, "utf8");
} catch {
  console.error("❌  Cannot read .env.local — run from the project root.\n");
  process.exit(1);
}

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

const token = process.env.BLOB_READ_WRITE_TOKEN;

console.log("\n🔵  Vercel Blob Direct Connectivity Test");
console.log("─".repeat(50));
console.log("\n[Token check]");
console.log("  BLOB_READ_WRITE_TOKEN:", token ? `${token.slice(0, 30)}…` : "❌  NOT FOUND");

if (!token) {
  console.error("\n❌  Token missing — add BLOB_READ_WRITE_TOKEN to .env.local\n");
  process.exit(1);
}

if (!token.startsWith("vercel_blob_rw_")) {
  console.error("\n❌  Token has wrong prefix — expected vercel_blob_rw_*\n");
  process.exit(1);
}

console.log("  Prefix  : ✅  vercel_blob_rw_*");
console.log("  Length  :", token.length, "chars");

// ── 2. Dynamic import of @vercel/blob ────────────────────────────────────────

let put, head;
try {
  const blob = await import("@vercel/blob");
  put = blob.put;
  head = blob.head;
  console.log("\n[SDK check]");
  console.log("  @vercel/blob imported ✅");
  console.log("  put  :", typeof put);
  console.log("  head :", typeof head);
} catch (err) {
  console.error("\n❌  Could not import @vercel/blob:", err.message);
  process.exit(1);
}

// ── 3. put() — write a tiny test blob ────────────────────────────────────────

const testId = `test-${Date.now()}`;
const testPath = `shares/${testId}.txt`;
const testContent = "gtf-studio-blob-test";

console.log(`\n[put()]  Uploading "${testPath}" …`);
let blobResult;
try {
  blobResult = await put(testPath, testContent, {
    access: "private",
    addRandomSuffix: false,
    contentType: "text/plain; charset=utf-8",
    token,
  });
  console.log("  ✅  put() succeeded!");
  console.log("  URL:", blobResult.url);
} catch (err) {
  console.error("\n❌  put() FAILED — this is the real error:\n");
  console.error("  Name   :", err.name ?? "(none)");
  console.error("  Message:", err.message ?? "(none)");
  console.error("  Status :", err.status ?? "(none)");
  console.error("  Cause  :", err.cause ?? "(none)");
  console.error("\n  Full error:\n", err);
  process.exit(1);
}

// ── 4. head() — verify the blob exists ───────────────────────────────────────

console.log(`\n[head()]  Verifying blob exists at ${blobResult.url} …`);
try {
  const info = await head(blobResult.url, { token });
  console.log("  ✅  head() confirmed!");
  console.log("  Size        :", info.size, "bytes");
  console.log("  Content-Type:", info.contentType);
} catch (err) {
  console.warn("  ⚠️  head() failed (non-fatal):", err.message);
}

// ── 5. Summary ───────────────────────────────────────────────────────────────

console.log("\n" + "─".repeat(50));
console.log("🎉  Vercel Blob is WORKING!\n");
console.log("  The /api/share route should now succeed.");
console.log("  Run: node scripts/test-share-link.mjs\n");
console.log("─".repeat(50) + "\n");
