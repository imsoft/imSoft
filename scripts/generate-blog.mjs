#!/usr/bin/env node
/**
 * Genera y publica un artículo de blog automáticamente en Supabase.
 * - Texto: Claude Haiku (Anthropic)
 * - Imagen: Gemini 2.0 Flash Image Generation (Google AI Studio)
 * - Almacenamiento: Supabase Storage (bucket "blog-images")
 *
 * Variables de entorno requeridas:
 *   ANTHROPIC_API_KEY         — API key de Anthropic
 *   GEMINI_API_KEY            — API key de Google AI Studio
 *   NEXT_PUBLIC_SUPABASE_URL  — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (bypasses RLS)
 *   BLOG_AUTHOR_ID            — UUID del usuario autor en Supabase
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_ID = process.env.BLOG_AUTHOR_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = "https://imsoft.io";
const NOTIFY_EMAIL = "contacto@imsoft.io";

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
- Hoy es ${today}. Categoría del artículo: "${category.label_es}" (${category.label_en})`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      tools: [
        {
          name: "publish_blog_post",
          description: "Publica un artículo de blog bilingüe en el sitio de imSoft.",
          input_schema: {
            type: "object",
            properties: {
              title_es: { type: "string", description: "Título en español (máx 70 chars)" },
              title_en: { type: "string", description: "Title in English (max 70 chars)" },
              excerpt_es: { type: "string", description: "Resumen en español (máx 160 chars)" },
              excerpt_en: { type: "string", description: "Summary in English (max 160 chars)" },
              content_es: { type: "string", description: "Contenido HTML completo en español" },
              content_en: { type: "string", description: "Full HTML content in English" },
            },
            required: ["title_es", "title_en", "excerpt_es", "excerpt_en", "content_es", "content_en"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "publish_blog_post" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Claude API error ${response.status}: ${rawText}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error("Respuesta de Claude (primeros 500 chars):", rawText.substring(0, 500));
    throw new Error(`Respuesta de Claude no es JSON válido: ${e.message}`);
  }

  const toolUse = data.content.find((b) => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude no devolvió una llamada de herramienta.");

  return toolUse.input;
}

async function generateImage(title_en, category_en) {
  const prompt = `2D flat vector illustration for a tech blog post header. Topic: "${title_en}". Main character: a single friendly cute robot mascot, rounded body, big expressive eyes, small antennas, built from smooth geometric shapes. The robot is doing an action that represents the article topic (e.g. building, analyzing, optimizing, connecting). Color palette: robot body in blue #4A7FD4 and white, accents in dark navy #1e3a5f, background very light gray #F8FAFC or white, soft blue #E8F0FC for glow or fills. Art style: clean Undraw.co / Storyset flat 2D illustration, bold outlines, no gradients, no textures, minimal and modern. Composition: 16:9 wide, robot slightly off-center, surrounded by simple geometric icons or abstract shapes that relate to the topic. Absolutely NO: human characters, website UI screenshots, text, logos, watermarks, photo-realistic rendering.`;

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

function buildSuccessEmail({ title_es, title_en, slug, category, imageUrl }) {
  const postUrl = `${SITE_URL}/es/blog/${slug}`;
  const date = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <img src="${SITE_URL}/logos/logo-imsoft-blue.png" alt="imSoft" width="120" style="display:block;margin:0 auto 20px;height:auto;"/>
          <div style="display:inline-block;background-color:#22c55e;border-radius:100px;padding:4px 16px;margin-bottom:12px;">
            <span style="color:#fff;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">✓ Publicación Exitosa</span>
          </div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3;">
            Nuevo artículo publicado en <span style="color:#a5b4fc;">imsoft.io</span>
          </h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:36px 40px;">
          <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;">Detalles del artículo</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
            <tr style="background-color:#f8fafc;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;width:120px;border-bottom:1px solid #e2e8f0;">Título ES</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;font-weight:500;border-bottom:1px solid #e2e8f0;">${title_es}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Título EN</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${title_en}</td>
            </tr>
            <tr style="background-color:#f8fafc;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Categoría</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${category}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Fecha</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${date}</td>
            </tr>
            <tr style="background-color:#f8fafc;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">Imagen</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;">${imageUrl ? "✓ Generada con Imagen 4.0 Fast (Google)" : "Sin imagen (revisar GEMINI_API_KEY)"}</td>
            </tr>
          </table>
          <div style="text-align:center;margin-bottom:8px;">
            <a href="${postUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;padding:13px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-right:12px;">Ver artículo →</a>
            <a href="${SITE_URL}/es/dashboard/admin/blog" style="display:inline-block;background-color:#0f172a;color:#ffffff;padding:13px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Dashboard</a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0f172a;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#475569;">Generado automáticamente por el workflow de GitHub Actions</p>
          <p style="margin:0;font-size:12px;color:#334155;">© ${new Date().getFullYear()} imSoft · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildErrorEmail(errorMessage) {
  const date = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <img src="${SITE_URL}/logos/logo-imsoft-blue.png" alt="imSoft" width="120" style="display:block;margin:0 auto 20px;height:auto;"/>
          <div style="display:inline-block;background-color:#ef4444;border-radius:100px;padding:4px 16px;margin-bottom:12px;">
            <span style="color:#fff;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">✗ Error en publicación</span>
          </div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3;">
            El artículo automático <span style="color:#fca5a5;">no se publicó</span>
          </h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:36px 40px;">
          <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:0.08em;">Detalle del error</h2>
          <div style="background-color:#fef2f2;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:16px 20px;font-size:13px;font-family:monospace;line-height:1.6;color:#7f1d1d;white-space:pre-wrap;margin-bottom:28px;">${errorMessage}</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
            <tr style="background-color:#f8fafc;">
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;width:120px;">Fecha</td>
              <td style="padding:12px 16px;font-size:14px;color:#0f172a;">${date}</td>
            </tr>
          </table>
          <div style="text-align:center;">
            <a href="https://github.com/imsoft/imSoft/actions" style="display:inline-block;background-color:#6366f1;color:#ffffff;padding:13px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Ver logs en GitHub Actions →</a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0f172a;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#475569;">Notificación automática del workflow de GitHub Actions</p>
          <p style="margin:0;font-size:12px;color:#334155;">© ${new Date().getFullYear()} imSoft · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(subject, html) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurado — omitiendo notificación por email.");
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `imSoft Blog <${NOTIFY_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    console.warn(`No se pudo enviar el email de notificación: ${err}`);
  }
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

  let imageUrl = null;
  try {
    console.log("Generando imagen con Gemini 2.5 Flash Image...");
    const { buffer, mimeType } = await generateImage(generated.title_en, category.label_en);
    console.log("Subiendo imagen a Supabase Storage...");
    imageUrl = await uploadImageToSupabase(buffer, slug, mimeType);
    console.log(`Imagen: ${imageUrl}`);
  } catch (imgErr) {
    console.warn(`Advertencia: no se pudo generar la imagen (${imgErr.message}). El artículo se publicará sin imagen.`);
  }

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
    author_name: 'Brandon Garcia',
    published: true,
  };

  const result = await publishPost(post);
  console.log(`Publicado exitosamente. ID: ${result[0]?.id}, Slug: ${slug}`);

  await sendEmail(
    `✓ Nuevo artículo publicado: ${generated.title_es}`,
    buildSuccessEmail({
      title_es: generated.title_es,
      title_en: generated.title_en,
      slug,
      category: category.label_es,
      imageUrl,
    })
  );
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  await sendEmail(
    `✗ Error al publicar artículo automático — ${new Date().toLocaleDateString("es-MX")}`,
    buildErrorEmail(err.message)
  );
  process.exit(1);
});
