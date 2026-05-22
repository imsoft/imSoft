#!/usr/bin/env node
/**
 * Genera imágenes con Gemini 2.0 Flash para los posts del blog que tienen image_url = null.
 * Ejecutar: node scripts/backfill-images.mjs
 *
 * Variables de entorno requeridas:
 *   GEMINI_API_KEY            — API key de Google AI Studio
 *   NEXT_PUBLIC_SUPABASE_URL  — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan variables de entorno: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
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
  const prompt = `2D flat vector illustration for a tech blog post header. Topic: "${title_en}". Main character: a single friendly cute robot mascot, rounded body, big expressive eyes, small antennas, built from smooth geometric shapes. The robot is doing an action that represents the article topic (e.g. building, analyzing, optimizing, connecting). Color palette: robot body in blue #4A7FD4 and white, accents in dark navy #1e3a5f, background very light gray #F8FAFC or white, soft blue #E8F0FC for glow or fills. Art style: clean Undraw.co / Storyset flat 2D illustration, bold outlines, no gradients, no textures, minimal and modern. Composition: 16:9 wide, robot slightly off-center, surrounded by simple geometric icons or abstract shapes that relate to the topic. Absolutely NO: human characters, website UI screenshots, text, logos, watermarks, photo-realistic rendering.`;

  console.log(`  Generando imagen con Imagen 4.0 Fast...`);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: "16:9" },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Imagen 4.0 API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) throw new Error("Imagen 4.0 no devolvió imagen.");

  return { buffer: Buffer.from(prediction.bytesBase64Encoded, "base64"), mimeType: prediction.mimeType || "image/png" };
}

async function uploadImageToSupabase(imageBuffer, slug, mimeType = "image/png") {
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const filename = `${slug}-${Date.now()}.${ext}`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/blog-images/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": mimeType,
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
      const { buffer, mimeType } = await generateImage(title, post.category || "technology");
      console.log(`  Subiendo a Supabase Storage...`);
      const imageUrl = await uploadImageToSupabase(buffer, post.slug, mimeType);
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
