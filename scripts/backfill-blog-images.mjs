#!/usr/bin/env node
/**
 * Adds a cover to published posts that have none (they showed the logo).
 *
 *   node scripts/backfill-blog-images.mjs               # lists what it would do
 *   node scripts/backfill-blog-images.mjs --apply       # generates, uploads and assigns
 *   node scripts/backfill-blog-images.mjs --recompress  # recompresses heavy covers already uploaded
 *
 * Uses the same generator as the automated blog (scripts/lib/blog-image.mjs), so
 * covers keep the same style. Needs GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY in the environment or in .env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compressCover, generateImage, uploadImageToSupabase } from "./lib/blog-image.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const RECOMPRESS = process.argv.includes("--recompress");
const MAX_SIZE = 200 * 1024;

// Minimal .env reader, as in gsc-report.mjs.
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const headers = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

/** Uploaded covers heavier than MAX_SIZE: downloaded, compressed and replaced. */
async function recompress() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/blog?select=id,slug,slug_es,image_url&published=eq.true&image_url=like.*blog-images*`, { headers });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const posts = await r.json();
  let done = 0;
  for (const p of posts) {
    const head = await fetch(p.image_url, { method: "HEAD" });
    const size = Number(head.headers.get("content-length") ?? 0);
    if (!head.ok || size <= MAX_SIZE) continue;
    try {
      const original = Buffer.from(await (await fetch(p.image_url)).arrayBuffer());
      const { buffer, mimeType } = await compressCover(original);
      const url = await uploadImageToSupabase(buffer, p.slug, mimeType, { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY });
      const u = await fetch(`${SUPABASE_URL}/rest/v1/blog?id=eq.${p.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ image_url: url }),
      });
      if (!u.ok) throw new Error(`PATCH ${u.status}: ${await u.text()}`);
      done += 1;
      console.log(`✓ ${p.slug_es || p.slug}: ${Math.round(size / 1024)} KB → ${Math.round(buffer.length / 1024)} KB`);
    } catch (err) {
      console.error(`✗ ${p.slug_es || p.slug}: ${err.message}`);
    }
  }
  console.log(`\nRecomprimidas: ${done} de ${posts.length} portadas.`);
}

async function main() {
  if (RECOMPRESS) return recompress();
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?select=id,slug,slug_es,title_en,title_es&published=eq.true&image_url=is.null&order=created_at.desc`,
    { headers }
  );
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const posts = await r.json();
  console.log(`${posts.length} artículos publicados sin portada.${APPLY ? "" : " (sin --apply solo se listan)"}`);

  let ok = 0;
  for (const p of posts) {
    const title = p.title_en || p.title_es;
    console.log(`\n- ${p.slug_es || p.slug}\n  ${title}`);
    if (!APPLY) continue;
    try {
      const { buffer, mimeType } = await generateImage(title, GEMINI_API_KEY);
      const url = await uploadImageToSupabase(buffer, p.slug, mimeType, { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY });
      const u = await fetch(`${SUPABASE_URL}/rest/v1/blog?id=eq.${p.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ image_url: url }),
      });
      if (!u.ok) throw new Error(`PATCH ${u.status}: ${await u.text()}`);
      ok += 1;
      console.log(`  ✓ ${url}`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }
  if (APPLY) console.log(`\nListo: ${ok}/${posts.length} con portada nueva.`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
