#!/usr/bin/env node
/**
 * Genera y publica un artículo de blog automáticamente en Supabase.
 * - Texto: Claude Haiku (Anthropic)
 * - Imagen: Imagen 3 (Google Gemini)
 * - Almacenamiento: Supabase Storage (bucket "images", ruta blog/)
 *
 * Variables de entorno requeridas:
 *   ANTHROPIC_API_KEY         — API key de Anthropic
 *   GEMINI_API_KEY            — API key de Google AI Studio (Gemini / Imagen 3)
 *   SUPABASE_URL              — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (bypasses RLS)
 *   BLOG_AUTHOR_ID            — UUID del usuario autor en Supabase
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_ID = process.env.BLOG_AUTHOR_ID;

if (!ANTHROPIC_API_KEY || !GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BLOG_AUTHOR_ID) {
  console.error("Faltan variables de entorno requeridas.");
  process.exit(1);
}

const CATEGORIES = [
  { value: "technology", label_es: "Tecnología", label_en: "Technology" },
  { value: "development", label_es: "Desarrollo", label_en: "Development" },
  { value: "business", label_es: "Negocios", label_en: "Business" },
  { value: "marketing", label_es: "Marketing", label_en: "Marketing" },
  { value: "design", label_es: "Diseño", label_en: "Design" },
  { value: "tutorials", label_es: "Tutoriales", label_en: "Tutorials" },
  { value: "tips", label_es: "Tips y Trucos", label_en: "Tips & Tricks" },
  { value: "news", label_es: "Noticias", label_en: "News" },
];

function pickCategory() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return CATEGORIES[dayOfYear % CATEGORIES.length];
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

async function generateBlogPost(category) {
  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `Eres el redactor de contenido de imSoft, una agencia de desarrollo de software mexicana especializada en sitios web, aplicaciones móviles, e-commerce y transformación digital.

## AUDIENCIA
Emprendedores, dueños de PyME, directores/gerentes y startups tech en México y Latinoamérica que quieren digitalizarse o mejorar su presencia online.

## OBJETIVO
Cada artículo debe GENERAR LEADS para imSoft. El lector debe terminar con ganas de contactar a imSoft para resolver su problema.

## TONO
Profesional y directo. Sin rodeos. Orientado a resultados de negocio. Primera persona plural ("en imSoft sabemos que...", "lo que hacemos es..."). Sin tutear.

## TEMAS PRINCIPALES (rota entre estos según sea relevante para la categoría)
- Desarrollo web y apps (Next.js, React, apps móviles, tecnologías modernas)
- Transformación digital (cómo digitalizar negocios, automatización, herramientas para PyMEs)
- E-commerce y ventas online (tiendas en línea, pagos, estrategias de venta digital)
- Marketing digital y SEO (posicionamiento, Google, redes sociales, contenido)

## ESTRUCTURA DEL ARTÍCULO
1. Introducción: enganchar con un problema real del lector (2-3 párrafos)
2. Desarrollo: 3-4 secciones con subtítulos <h2>, datos concretos y ejemplos prácticos
3. Conclusión: síntesis del valor + CTA directo a WhatsApp

## CTA OBLIGATORIO AL FINAL
El artículo DEBE terminar con este bloque HTML exacto (no lo modifiques):
<div class="cta-blog"><p><strong>¿Listo para dar el siguiente paso?</strong> En imSoft te ayudamos a llevarlo a la realidad. <a href="https://wa.me/523325365558" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a> y cuéntanos tu proyecto — la primera consultoría es sin costo.</p></div>

## REQUISITOS TÉCNICOS
- Entre 650-950 palabras de contenido real
- HTML semántico: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> — SIN <h1>, SIN markdown
- Optimizado para SEO: incluye la keyword principal 3-5 veces de forma natural
- Hoy es ${today}. Categoría del artículo: "${category.label_es}" (${category.label_en})

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "title_es": "Título con keyword principal en español (máx 70 chars)",
  "title_en": "Title with main keyword in English (max 70 chars)",
  "excerpt_es": "Resumen directo que describe el valor del artículo (máx 160 chars)",
  "excerpt_en": "Direct summary describing the article value (max 160 chars)",
  "content_es": "<p>Contenido HTML completo en español incluyendo el CTA final...</p>",
  "content_en": "<p>Full HTML content in English including the final CTA...</p>"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text.trim();

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La respuesta de Claude no contiene JSON válido.");

  return JSON.parse(jsonMatch[0]);
}

async function generateImage(title_en, category_en) {
  const prompt = `Flat illustration style blog header image for a Mexican software agency called imSoft. Article topic: "${title_en}" (${category_en} category). Style: clean 2D flat illustration, friendly characters (diverse Latin professionals), geometric shapes. Color palette: imSoft brand blue (#4A7FD4) as dominant color, with white, light gray and soft blue accents. Wide 16:9 composition with clear focal point. No text, no logos, no watermarks. Professional, modern, optimistic mood. Suitable for a B2B software agency blog targeting entrepreneurs and SMB owners.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
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
    throw new Error(`Imagen 3 API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error("Imagen 3 no devolvió imagen.");

  return Buffer.from(base64, "base64");
}

async function uploadImageToSupabase(imageBuffer, slug) {
  const filename = `blog/${slug}-${Date.now()}.png`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/images/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "image/png",
        "Cache-Control": "3600",
      },
      body: imageBuffer,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase Storage upload error ${response.status}: ${error}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/images/${filename}`;
}

async function slugExists(slug) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?slug=eq.${encodeURIComponent(slug)}&select=id`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const data = await response.json();
  return Array.isArray(data) && data.length > 0;
}

async function publishPost(post) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase insert error ${response.status}: ${error}`);
  }

  return response.json();
}

async function main() {
  const category = pickCategory();
  console.log(`Generando artículo para categoría: ${category.label_es}`);

  const generated = await generateBlogPost(category);
  console.log(`Título: ${generated.title_es}`);

  let slug = slugify(generated.title_en);
  if (await slugExists(slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  console.log("Generando imagen con Imagen 3...");
  const imageBuffer = await generateImage(generated.title_en, category.label_en);

  console.log("Subiendo imagen a Supabase Storage...");
  const imageUrl = await uploadImageToSupabase(imageBuffer, slug);
  console.log(`Imagen: ${imageUrl}`);

  const post = {
    title_es: generated.title_es,
    title_en: generated.title_en,
    title: generated.title_es,
    content_es: generated.content_es,
    content_en: generated.content_en,
    content: generated.content_es,
    excerpt_es: generated.excerpt_es || null,
    excerpt_en: generated.excerpt_en || null,
    excerpt: generated.excerpt_es || null,
    slug,
    image_url: imageUrl,
    category: category.value,
    author_id: BLOG_AUTHOR_ID,
    published: true,
  };

  const result = await publishPost(post);
  console.log(`Publicado exitosamente. ID: ${result[0]?.id}, Slug: ${slug}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
