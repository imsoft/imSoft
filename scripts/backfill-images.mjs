#!/usr/bin/env node
/**
 * Genera imágenes con Pollinations AI para los posts del blog que tienen image_url = null.
 * Ejecutar: node scripts/backfill-images.mjs
 *
 * Variables de entorno requeridas:
 *   NEXT_PUBLIC_SUPABASE_URL  — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function fetchPostsWithoutImage() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?image_url=is.null&published=eq.true&select=id,title_en,title_es,slug,category`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function generateImage(title_en, category) {
  const promptText = `Flat illustration style blog header image for a Mexican software agency. Article topic: ${title_en}, category: ${category}. Style: clean 2D flat illustration, friendly diverse Latin professionals, geometric shapes. Color palette: blue #4A7FD4 dominant, white and light gray accents. Wide 16:9 composition. No text, no logos, no watermarks. Professional, modern, optimistic mood.`;

  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=1200&height=675&nologo=true&seed=${seed}&model=flux`;

  console.log(`  Generando imagen (puede tardar 15-30 segundos)...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pollinations API error ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToSupabase(imageBuffer, slug) {
  const filename = `${slug}-${Date.now()}.jpg`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/blog-images/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "image/jpeg",
        "Cache-Control": "3600",
      },
      body: imageBuffer,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase Storage upload error ${response.status}: ${error}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${filename}`;
}

async function updatePostImage(id, imageUrl) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase update error ${response.status}: ${error}`);
  }
}

async function main() {
  console.log("Buscando posts sin imagen...");
  const posts = await fetchPostsWithoutImage();

  if (posts.length === 0) {
    console.log("Todos los posts ya tienen imagen. Nada que hacer.");
    return;
  }

  console.log(`Encontrados ${posts.length} post(s) sin imagen.\n`);

  for (const post of posts) {
    const title = post.title_en || post.title_es || "Blog post";
    console.log(`Procesando: "${title}" (${post.slug})`);

    try {
      const imageBuffer = await generateImage(title, post.category || "technology");
      console.log(`  Subiendo a Supabase Storage...`);
      const imageUrl = await uploadImageToSupabase(imageBuffer, post.slug);
      await updatePostImage(post.id, imageUrl);
      console.log(`  ✓ Imagen actualizada: ${imageUrl}\n`);
    } catch (err) {
      console.error(`  ✗ Error procesando "${title}": ${err.message}\n`);
    }
  }

  console.log("Backfill completado.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
