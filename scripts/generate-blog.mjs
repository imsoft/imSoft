#!/usr/bin/env node
/**
 * Genera y publica un artículo de blog en Supabase, a partir de una cola de búsquedas
 * reales (content/blog-queue.json).
 *
 *   node --experimental-strip-types scripts/generate-blog.mjs            # publica
 *   node --experimental-strip-types scripts/generate-blog.mjs --dry-run  # genera y valida, no publica
 *
 * - Tema: la primera entrada de la cola sin post publicado. Sin cola pendiente, no publica.
 * - Texto: Claude Opus 5 con búsqueda web, para que las cifras salgan de fuentes reales.
 * - Validación (src/lib/blog-generator.ts): toda cifra con fuente enlazada en el mismo
 *   párrafo, mínimo 2 fuentes externas y que cada una responda 200. Si no pasa, no publica.
 * - Imagen: Gemini 3.1 Flash Image (Google AI Studio). Si falla, NO se publica sin portada.
 * - Guarda `slug` (inglés) y `slug_es`, que es la URL que ve Google en /es.
 *
 * Variables de entorno: ANTHROPIC_API_KEY, GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, BLOG_AUTHOR_ID y, opcional, RESEND_API_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { generateImage, uploadImageToSupabase } from "./lib/blog-image.mjs";
import {
  MAX_TITLE_OVERLAP,
  pickNextTopic,
  titleOverlap,
  validateArticle,
} from "../src/lib/blog-generator.ts";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_ID = process.env.BLOG_AUTHOR_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = "https://www.imsoft.io";
const NOTIFY_EMAIL = "contacto@imsoft.io";
const NOTIFY_EMAIL_CC = "weareimsoft@gmail.com";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

if (!ANTHROPIC_API_KEY || !GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BLOG_AUTHOR_ID) {
  console.error("Faltan variables de entorno requeridas.");
  process.exit(1);
}

const CATEGORY_LABELS = {
  technology: "Tecnología",
  development: "Desarrollo",
  business: "Negocios",
  marketing: "Marketing",
  design: "Diseño",
  tutorials: "Tutoriales",
  tips: "Tips y Trucos",
  news: "Noticias",
};

const supabaseHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

/** Slugs y títulos ya publicados: para elegir tema y para la puerta anti-duplicados. */
async function fetchExistingPosts() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?select=slug,slug_es,title_es,title_en&order=created_at.desc`,
    { headers: supabaseHeaders }
  );
  if (!response.ok) throw new Error(`Supabase ${response.status} al leer los posts existentes`);
  return response.json();
}

function loadQueue() {
  const raw = fs.readFileSync(path.join(ROOT, "content", "blog-queue.json"), "utf8");
  return JSON.parse(raw).temas;
}

const CTA_HTML =
  '<div class="cta-blog"><p><strong>¿Listo para dar el siguiente paso?</strong> En imSoft te ayudamos a llevarlo a la realidad. <a href="https://wa.me/523325365558" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a> y cuéntanos tu proyecto — la primera consultoría es sin costo.</p></div>';
const CTA_HTML_EN =
  '<div class="cta-blog"><p><strong>Ready to take the next step?</strong> At imSoft we help you make it real. <a href="https://wa.me/523325365558" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> and tell us about your project — the first consultation is free.</p></div>';

const PUBLISH_TOOL = {
  name: "publish_blog_post",
  description:
    "Entrega el artículo terminado. Llámala una sola vez, al final, cuando ya investigaste y tienes las fuentes.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title_es: { type: "string", description: "Título en español, máximo 70 caracteres, que responda la búsqueda" },
      title_en: { type: "string", description: "Title in English, max 70 characters" },
      excerpt_es: { type: "string", description: "Resumen en español, máximo 160 caracteres" },
      excerpt_en: { type: "string", description: "Summary in English, max 160 characters" },
      content_es: { type: "string", description: "Cuerpo en HTML (h2, h3, p, ul, ol, li, table, strong, a). Sin h1, sin markdown, sin el CTA final." },
      content_en: { type: "string", description: "Body in HTML, same rules, English" },
      fuentes: {
        type: "array",
        description: "Cada fuente externa que enlazas en el texto. La URL debe ser exactamente la que pusiste en el href.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            url: { type: "string" },
            titulo: { type: "string" },
            respalda: { type: "string", description: "Qué dato del artículo respalda esta fuente" },
          },
          required: ["url", "titulo", "respalda"],
        },
      },
    },
    required: ["title_es", "title_en", "excerpt_es", "excerpt_en", "content_es", "content_en", "fuentes"],
  },
};

function buildPrompt(topic, existingTitles) {
  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  return `Escribes para el blog de imSoft, una agencia de desarrollo de software de Guadalajara, México (páginas web, tiendas en línea, apps móviles y software a medida). Hoy es ${today}.

## Para quién
Dueños de negocio y directivos en México que teclearon en Google exactamente esto: "${topic.busqueda}". Quieren una respuesta útil, no un discurso de ventas.

## Qué debe cubrir el artículo
${topic.angulo}

## Regla número uno: nada de cifras sin fuente
Antes de escribir, investiga con la herramienta de búsqueda web. Toda cifra (precios, porcentajes, tarifas, plazos, "según…") tiene que venir de una página real que hayas encontrado, enlazada con <a href="URL exacta"> en el MISMO párrafo o item de lista donde aparece la cifra. Si no encuentras fuente para un dato, no lo pongas. Preferimos un artículo con cuatro cifras verificables a uno con veinte inventadas. Prioriza fuentes mexicanas y recientes, y anota junto a cada fuente su fecha si la tiene.

Declara cada fuente que enlaces en el campo "fuentes", con la URL idéntica a la del href. Mínimo dos fuentes externas distintas. No enlaces a imsoft.io ni a wa.me dentro del cuerpo.

## Cómo escribir
- Responde la pregunta en los primeros dos párrafos. Después, el detalle.
- Tono directo y concreto, de alguien que hace este trabajo todos los días. Primera persona del plural cuando hables de imSoft, y solo al final.
- Sin frases de relleno ("en el mundo digital de hoy…"), sin prometer resultados, sin adjetivos vacíos.
- Cuando compares opciones, di honestamente cuándo la opción barata es la correcta.
- Entre 900 y 1,400 palabras por idioma. HTML semántico: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <table>, <strong>, <a>. Sin <h1>, sin markdown.
- Termina con una sección corta sobre cómo lo hacemos en imSoft, sin inventar precios ni cifras nuestras: solo que damos una propuesta con precio fijo en 48 horas y que la primera llamada no cuesta. No incluyas el bloque CTA final: lo agrega el sistema.
- La versión en inglés es una traducción fiel de la española, con las mismas fuentes y enlaces.

## Ya publicado (no repitas ni reformules)
${existingTitles.map((t) => `- ${t}`).join("\n")}

Cuando termines, llama a publish_blog_post una sola vez con el artículo completo.`;
}

async function generateBlogPost(topic, existingTitles) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const tools = [
    { type: "web_search_20260209", name: "web_search", max_uses: 10, user_location: { type: "approximate", country: "MX" } },
    PUBLISH_TOOL,
  ];
  const messages = [{ role: "user", content: buildPrompt(topic, existingTitles) }];

  for (let intento = 0; intento < 4; intento += 1) {
    // Streaming: el SDK lo exige para respuestas largas, y esta puede tardar minutos.
    const response = await client.messages
      .stream({
        model: "claude-opus-5",
        max_tokens: 32000,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        tools,
        messages,
      })
      .finalMessage();
    const publish = response.content.find((b) => b.type === "tool_use" && b.name === "publish_blog_post");
    if (publish) return publish.input;
    if (response.stop_reason === "pause_turn") {
      // El bucle de búsqueda del servidor se pausó: se reenvía tal cual y continúa.
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    if (response.stop_reason === "refusal") {
      throw new Error(`Claude rechazó la petición: ${response.stop_details?.explanation ?? "sin detalle"}`);
    }
    throw new Error(`Claude terminó con stop_reason=${response.stop_reason} sin llamar a publish_blog_post.`);
  }
  throw new Error("Claude no entregó el artículo tras varias pausas de búsqueda.");
}

/** Cada fuente declarada tiene que responder: una URL alucinada no pasa. */
async function verifySources(fuentes) {
  const fallidas = [];
  for (const f of fuentes) {
    try {
      const r = await fetch(f.url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (imSoft blog source check)" }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) fallidas.push(`${f.url} → HTTP ${r.status}`);
    } catch (err) {
      fallidas.push(`${f.url} → ${err.message}`);
    }
  }
  return fallidas;
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
  const postUrl = `${SITE_URL}/es/blog/${slug}`; // slug_es
  const date = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Open Sans','Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header con gradiente de marca -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1a4a7a 100%);padding:40px 40px 32px;text-align:center;">
          <img src="${SITE_URL}/logos/logo-imsoft-white.png" alt="imSoft" width="110" style="display:block;margin:0 auto 24px;height:auto;"/>
          <!-- Badge éxito -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
            <tr><td style="background-color:#16a34a;border-radius:100px;padding:5px 18px;">
              <span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">✓ &nbsp;Publicación Exitosa</span>
            </td></tr>
          </table>
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;line-height:1.4;letter-spacing:-0.01em;">
            Nuevo artículo publicado en<br/><span style="color:#4A7FD4;">imsoft.io</span>
          </h1>
        </td></tr>

        <!-- Divider accent -->
        <tr><td style="background:linear-gradient(90deg,#4A7FD4,#1e9df0);height:3px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#4A7FD4;text-transform:uppercase;letter-spacing:0.10em;">
            Detalles del artículo
          </p>

          <!-- Tabla de datos -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:32px;">
            <tr style="background-color:#f8fafc;">
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;width:110px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">Título ES</td>
              <td style="padding:13px 18px;font-size:14px;color:#0f172a;font-weight:600;border-bottom:1px solid #e2e8f0;">${title_es}</td>
            </tr>
            <tr>
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;white-space:nowrap;">Título EN</td>
              <td style="padding:13px 18px;font-size:14px;color:#475569;border-bottom:1px solid #e2e8f0;">${title_en}</td>
            </tr>
            <tr style="background-color:#f8fafc;">
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;white-space:nowrap;">Categoría</td>
              <td style="padding:13px 18px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">
                <span style="background-color:#dbeafe;color:#1e40af;font-size:12px;font-weight:600;padding:3px 10px;border-radius:100px;">${category}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;white-space:nowrap;">Fecha</td>
              <td style="padding:13px 18px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${date}</td>
            </tr>
            <tr style="background-color:#f8fafc;">
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;white-space:nowrap;">Imagen</td>
              <td style="padding:13px 18px;font-size:14px;color:#0f172a;">
                ${imageUrl
                  ? `<span style="color:#16a34a;font-weight:600;">✓ Generada con Imagen 4.0 (Google)</span>`
                  : `<span style="color:#dc2626;">⚠ Sin imagen — revisar GEMINI_API_KEY</span>`}
              </td>
            </tr>
          </table>

          <!-- CTAs -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="padding-right:12px;">
                <a href="${postUrl}" style="display:inline-block;background:linear-gradient(135deg,#4A7FD4,#1e9df0);color:#ffffff;padding:13px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.01em;">
                  Ver artículo →
                </a>
              </td>
              <td>
                <a href="${SITE_URL}/es/dashboard/admin/blog" style="display:inline-block;background-color:#0f172a;color:#94a3b8;padding:13px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.01em;">
                  Dashboard
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:24px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Generado automáticamente por el workflow de GitHub Actions</p>
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} imSoft · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildErrorEmail(errorMessage) {
  const date = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  // Escape HTML entities in error message to prevent rendering issues
  const safeError = errorMessage
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Open Sans','Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header con gradiente de marca -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1a4a7a 100%);padding:40px 40px 32px;text-align:center;">
          <img src="${SITE_URL}/logos/logo-imsoft-white.png" alt="imSoft" width="110" style="display:block;margin:0 auto 24px;height:auto;"/>
          <!-- Badge error -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
            <tr><td style="background-color:#dc2626;border-radius:100px;padding:5px 18px;">
              <span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">✗ &nbsp;Error en Publicación</span>
            </td></tr>
          </table>
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;line-height:1.4;letter-spacing:-0.01em;">
            El artículo automático<br/><span style="color:#fca5a5;">no se publicó</span>
          </h1>
        </td></tr>

        <!-- Divider accent rojo -->
        <tr><td style="background:linear-gradient(90deg,#dc2626,#f87171);height:3px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:36px 40px;">
          <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.10em;">
            Detalle del error
          </p>

          <!-- Bloque de error estilo terminal -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background-color:#0f172a;border-radius:10px;padding:0;">
              <!-- Barra de terminal -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 16px;border-bottom:1px solid #1e293b;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;margin-right:6px;"></span>
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;margin-right:6px;"></span>
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;margin-right:6px;"></span>
                  <span style="font-size:11px;color:#475569;font-family:monospace;margin-left:6px;">error.log</span>
                </td></tr>
                <tr><td style="padding:16px 20px;font-size:12px;font-family:'Courier New',Courier,monospace;line-height:1.7;color:#fca5a5;white-space:pre-wrap;word-break:break-all;">${safeError}</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Tabla fecha -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:32px;">
            <tr style="background-color:#f8fafc;">
              <td style="padding:13px 18px;font-size:12px;font-weight:600;color:#64748b;width:110px;white-space:nowrap;">Fecha</td>
              <td style="padding:13px 18px;font-size:14px;color:#0f172a;font-weight:500;">${date}</td>
            </tr>
          </table>

          <!-- Pasos sugeridos -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefce8;border:1px solid #fde68a;border-radius:12px;margin-bottom:32px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;">¿Qué hacer?</p>
              <ul style="margin:0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.8;">
                <li>Revisa los logs completos en GitHub Actions</li>
                <li>Verifica que los secrets de Supabase y Anthropic estén configurados</li>
                <li>Comprueba que el esquema de la tabla <code style="background:#fde68a;padding:1px 4px;border-radius:4px;">blog</code> coincida con los campos del script</li>
              </ul>
            </td></tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td>
              <a href="https://github.com/imsoft/imSoft/actions" style="display:inline-block;background:linear-gradient(135deg,#4A7FD4,#1e9df0);color:#ffffff;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.01em;">
                Ver logs en GitHub Actions →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:24px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Notificación automática del workflow de GitHub Actions</p>
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} imSoft · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(subject, html) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY no configurado — no se puede enviar notificación. Agrega el secret en GitHub Actions.");
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
      to: [NOTIFY_EMAIL, NOTIFY_EMAIL_CC],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    console.error(`Error al enviar email (HTTP ${response.status}): ${err}`);
  } else {
    const data = await response.json();
    console.log(`Email enviado correctamente. ID: ${data.id}`);
  }
}

async function main() {
  const queue = loadQueue();
  const existing = await fetchExistingPosts();
  const existingSlugs = existing.flatMap((p) => [p.slug, p.slug_es]);
  const topic = pickNextTopic(queue, existingSlugs);
  if (!topic) {
    console.log("Cola de temas agotada: no se publica nada. Agrega búsquedas a content/blog-queue.json.");
    await sendEmail("Blog automático: cola de temas vacía", buildErrorEmail("No quedan temas pendientes en content/blog-queue.json. No se publicó nada."));
    return;
  }
  console.log(`Tema: "${topic.busqueda}" → /es/blog/${topic.slug_es}`);

  const existingTitles = existing.map((p) => p.title_es).filter(Boolean);
  const generated = await generateBlogPost(topic, existingTitles);
  console.log(`Título: ${generated.title_es}`);

  const problemas = [...validateArticle(generated, "es"), ...validateArticle(generated, "en")];
  const clash = existingTitles
    .map((t) => ({ t, score: titleOverlap(generated.title_es, t) }))
    .sort((a, b) => b.score - a.score)[0];
  if (clash && clash.score >= MAX_TITLE_OVERLAP) {
    problemas.push(`el título solapa ${(clash.score * 100).toFixed(0)}% con uno publicado: "${clash.t}"`);
  }
  problemas.push(...(await verifySources(generated.fuentes)).map((f) => `fuente que no responde: ${f}`));

  if (problemas.length > 0) {
    const detalle = problemas.map((p) => `- ${p}`).join("\n");
    throw new Error(`El artículo no pasó la validación y NO se publicó:\n${detalle}`);
  }
  console.log(`Validado: ${generated.fuentes.length} fuentes, todas responden.`);

  if (DRY_RUN) {
    const out = path.join(ROOT, ".blog-dry-run.json");
    fs.writeFileSync(out, JSON.stringify({ topic, ...generated }, null, 2));
    console.log(`--dry-run: no se genera imagen ni se publica. Artículo guardado en ${out}`);
    return;
  }

  // Sin portada no se publica: antes se publicaba igual y quedaron 11 posts sin imagen.
  console.log("Generando imagen...");
  const { buffer, mimeType } = await generateImage(generated.title_en, GEMINI_API_KEY);
  const imageUrl = await uploadImageToSupabase(buffer, topic.slug_en, mimeType, { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY });
  console.log(`Imagen: ${imageUrl}`);

  const post = {
    title_es: generated.title_es,
    title_en: generated.title_en,
    title: generated.title_es,
    content_es: `${generated.content_es}\n${CTA_HTML}`,
    content_en: `${generated.content_en}\n${CTA_HTML_EN}`,
    content: `${generated.content_es}\n${CTA_HTML}`,
    excerpt_es: generated.excerpt_es,
    excerpt_en: generated.excerpt_en,
    excerpt: generated.excerpt_es,
    slug: topic.slug_en,
    slug_es: topic.slug_es,
    image_url: imageUrl,
    category: topic.categoria,
    author_id: BLOG_AUTHOR_ID,
    published: true,
  };

  const result = await publishPost(post);
  console.log(`Publicado. ID: ${result[0]?.id} → ${SITE_URL}/es/blog/${topic.slug_es}`);

  await sendEmail(
    `✓ Nuevo artículo publicado: ${generated.title_es}`,
    buildSuccessEmail({
      title_es: generated.title_es,
      title_en: generated.title_en,
      slug: topic.slug_es,
      category: CATEGORY_LABELS[topic.categoria] ?? topic.categoria,
      imageUrl,
    })
  );
}

main().catch(async (err) => {
  console.error("Error:", err.message);
  if (DRY_RUN) process.exit(1);
  await sendEmail(
    `✗ Blog automático: no se publicó — ${new Date().toLocaleDateString("es-MX")}`,
    buildErrorEmail(err.message)
  );
  process.exit(1);
});
