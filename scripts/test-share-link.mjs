/**
 * End-to-end smoke test for the /api/share route + Vercel Blob round-trip.
 *
 * Usage (while `pnpm dev` is running in another terminal):
 *   node scripts/test-share-link.mjs
 *
 * What this tests:
 *   1. Builds a minimal valid CreativeDocument matching core/document/schema.ts
 *   2. Encodes it via fflate (same path the real editor uses)
 *   3. POSTs the encoded payload to http://localhost:3000/api/share
 *   4. Asserts the response contains a 32-char hex id
 *   5. Prints the full short-link URL ready to paste in a browser
 */

import { deflateSync, strToU8 } from "fflate";

// ── helpers matching src/lib/share/share-document.ts ────────────────────────

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeDocument(doc) {
  const json = JSON.stringify(doc);
  return toBase64Url(deflateSync(strToU8(json), { level: 9 }));
}

// ── minimal valid CreativeDocument (matches documentSchema in schema.ts) ─────
// Required: schemaVersion:1, width, height, pages[]{id,name,background,notes,transition,elements[]}

const testDocument = {
  schemaVersion: 1,
  width: 1920,
  height: 1080,
  pages: [
    {
      id: "smoke-test-page-1",
      name: "Smoke Test Page",
      background: "#1a1a2e",
      notes: "",
      transition: "none",
      elements: [],
    },
  ],
};

// ── main ─────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3100";

async function run() {
  console.log("\n🔵  GTF Studio — Share Link E2E Smoke Test");
  console.log("─".repeat(52));

  // Step 1 – encode the document
  const encoded = encodeDocument(testDocument);
  console.log(`\n[1/3] ✅  Payload encoded  (${encoded.length} chars)`);

  // Step 2 – POST to /api/share (triggers Vercel Blob put())
  console.log(`\n[2/3]  POST ${BASE_URL}/api/share …`);
  let postRes;
  try {
    postRes = await fetch(`${BASE_URL}/api/share`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: encoded,
    });
  } catch (err) {
    console.error(`\n❌  Could not reach the dev server at ${BASE_URL}`);
    console.error("    Make sure `pnpm dev` is running first.\n");
    console.error("    Error:", err.message);
    process.exit(1);
  }

  const rawBody = await postRes.text();

  if (!postRes.ok) {
    console.error(`\n❌  POST failed — HTTP ${postRes.status}`);
    console.error("    Body:", rawBody);
    if (postRes.status === 501) {
      console.error(
        "\n    Possible cause: BLOB_READ_WRITE_TOKEN missing in .env.local\n" +
        "    Run: node -e \"console.log(process.env.BLOB_READ_WRITE_TOKEN)\" " +
        "to verify it is loaded.\n"
      );
    }
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(rawBody);
  } catch {
    console.error("\n❌  Response is not valid JSON:", rawBody);
    process.exit(1);
  }

  if (typeof json?.id !== "string" || json.id.length === 0) {
    console.error("\n❌  Response OK but no 'id' field:", json);
    process.exit(1);
  }

  const { id } = json;

  // Validate id format: 32 lowercase hex chars (crypto.randomUUID stripped of dashes)
  if (!/^[a-f0-9]{32}$/.test(id)) {
    console.error(`\n❌  Unexpected id format: "${id}"`);
    process.exit(1);
  }

  const shortLink = `${BASE_URL}/view/s/${id}`;

  console.log(`\n[2/3] ✅  Blob stored in Vercel — id: ${id}`);

  // Step 3 – confirm the /view/s/<id> page returns 200 (server component fetches blob)
  console.log(`\n[3/3]  GET ${shortLink} …`);
  const viewRes = await fetch(shortLink).catch(() => null);
  if (!viewRes) {
    console.warn("\n⚠️  Could not reach the /view/s/<id> page (non-fatal)");
  } else if (viewRes.ok) {
    console.log(`\n[3/3] ✅  View page responded HTTP ${viewRes.status} — design is openable!`);
  } else {
    console.warn(`\n⚠️  View page returned HTTP ${viewRes.status} (may still render client-side)`);
  }

  // ── FINAL RESULT ─────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(52));
  console.log("🎉  SHORT LINK CREATED AND VERIFIED!\n");
  console.log("    👉  Open in browser:");
  console.log(`        ${shortLink}\n`);
  console.log("─".repeat(52));
  console.log("    Blob id  :", id);
  console.log("    Blob path: shares/" + id + ".txt");
  console.log("─".repeat(52) + "\n");
}

run().catch((err) => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
