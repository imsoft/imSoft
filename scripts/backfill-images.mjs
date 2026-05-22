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

async function generateImage(title_en) {
  const prompt = `2D flat vector illustration, pure white background (#FFFFFF). Topic: "${title_en}". Main character: one friendly cute robot mascot with rounded body, big expressive circular eyes, small antennas on top, smooth geometric limbs, colored in blue #4A7FD4 and white with navy #1e3a5f accents. The robot must be physically interacting with objects that represent the article topic — for example: if the topic is web optimization, the robot is tuning gears or a speedometer; if about e-commerce, the robot holds a shopping cart; if about digital transformation, the robot pushes a rocket; if about mistakes/errors, the robot holds a checklist with X marks. Floating around the robot: 3-5 simple flat icons directly related to "${title_en}" (no UI mockups, just symbolic icons like gears, charts, rockets, locks, stars). Color palette: blue #4A7FD4 dominant on robot, icon fills in soft blue #DBEAFE, background strictly white #FFFFFF, shadows/outlines in #1e3a5f. Art style: Undraw.co clean flat 2D, bold smooth outlines, zero gradients, zero textures. 16:9 wide composition, robot centered or slightly left. Absolutely NO: humans, website screenshots, UI mockups, text labels, logos, watermarks, photo-realism.`;

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
      const { buffer, mimeType } = await generateImage(title);
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
