/**
 * Portada de un articulo del blog: ilustracion con Gemini, comprimida con sharp y
 * subida a Supabase Storage. Lo usan scripts/generate-blog.mjs y
 * scripts/backfill-blog-images.mjs.
 */
import sharp from "sharp";

/** Ancho maximo con el que se muestra una portada; JPEG progresivo a calidad 80. */
export const COVER_MAX_WIDTH = 1600;

/**
 * Desde que las imagenes no pasan por el optimizador de Vercel se sirven tal cual, asi
 * que el peso se decide aqui, al subir: ~350 KB de Gemini pasan a ~120 KB.
 */
export async function compressCover(buffer) {
  const out = await sharp(buffer)
    .resize({ width: COVER_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toBuffer();
  return { buffer: out, mimeType: "image/jpeg" };
}

export async function generateImage(title_en, GEMINI_API_KEY) {
  const prompt = `2D flat vector illustration, pure white background (#FFFFFF). Topic: "${title_en}". Main character: one friendly cute robot mascot with rounded body, big expressive circular eyes, small antennas on top, smooth geometric limbs, colored in blue #4A7FD4 and white with navy #1e3a5f accents. The robot must be physically interacting with objects that represent the article topic — for example: if the topic is web optimization, the robot is tuning gears or a speedometer; if about e-commerce, the robot holds a shopping cart; if about digital transformation, the robot pushes a rocket; if about mistakes/errors, the robot holds a checklist with X marks. Floating around the robot: 3-5 simple flat icons directly related to "${title_en}" (no UI mockups, just symbolic icons like gears, charts, rockets, locks, stars). Color palette: blue #4A7FD4 dominant on robot, icon fills in soft blue #DBEAFE, background strictly white #FFFFFF, shadows/outlines in #1e3a5f. Art style: Undraw.co clean flat 2D, bold smooth outlines, zero gradients, zero textures. 16:9 wide composition, robot centered or slightly left. Absolutely NO: humans, website screenshots, UI mockups, text labels, logos, watermarks, photo-realism.`;

  // Imagen 4 ya no existe en esta API (404); las imagenes salen de los modelos Gemini
  // con salida de imagen via generateContent.
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini image API error ${response.status}: ${error.slice(0, 300)}`);
  }

  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error("Gemini no devolvió imagen.");

  return compressCover(Buffer.from(part.inlineData.data, "base64"));
}

export async function uploadImageToSupabase(imageBuffer, slug, mimeType, { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY }) {
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

