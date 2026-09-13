#!/usr/bin/env node
/**
 * Pone portada a los articulos publicados que no tienen (salian con el logo).
 *
 *   node scripts/backfill-blog-images.mjs               # lista lo que haria
 *   node scripts/backfill-blog-images.mjs --apply       # genera, sube y asigna
 *   node scripts/backfill-blog-images.mjs --recompress  # recomprime las portadas pesadas ya subidas
 *
 * Usa el mismo generador que el blog automatico (scripts/lib/blog-image.mjs), asi que
 * las portadas quedan con el mismo estilo. Necesita GEMINI_API_KEY,
 * NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno o en .env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compressCover, generateImage, uploadImageToSupabase } from "./lib/blog-image.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const RECOMPRESS = process.argv.includes("--recompress");
const PESO_MAXIMO = 200 * 1024;

// Lector minimo de .env, como en gsc-report.mjs.
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  for (const linea of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
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

/** Portadas ya subidas que pesan mas de PESO_MAXIMO: se bajan, comprimen y reemplazan. */
async function recompress() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/blog?select=id,slug,slug_es,image_url&published=eq.true&image_url=like.*blog-images*`, { headers });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const posts = await r.json();
  let hechas = 0;
  for (const p of posts) {
    const head = await fetch(p.image_url, { method: "HEAD" });
    const peso = Number(head.headers.get("content-length") ?? 0);
    if (!head.ok || peso <= PESO_MAXIMO) continue;
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
      hechas += 1;
      console.log(`✓ ${p.slug_es || p.slug}: ${Math.round(peso / 1024)} KB → ${Math.round(buffer.length / 1024)} KB`);
    } catch (err) {
      console.error(`✗ ${p.slug_es || p.slug}: ${err.message}`);
    }
  }
  console.log(`\nRecomprimidas: ${hechas} de ${posts.length} portadas.`);
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
    const titulo = p.title_en || p.title_es;
    console.log(`\n- ${p.slug_es || p.slug}\n  ${titulo}`);
    if (!APPLY) continue;
    try {
      const { buffer, mimeType } = await generateImage(titulo, GEMINI_API_KEY);
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
