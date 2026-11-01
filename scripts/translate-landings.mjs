/**
 * Translates the city + industry landing content into English.
 *
 * `src/config/landing-pages-data.ts` only exists in Spanish, so /en/<city>/<industry>
 * served the Spanish version and was canonicalized to /es (see src/config/landing-pages-i18n.ts).
 * This script generates `landingPagesDataEn` to actually enable them.
 *
 * It translates UNIQUE strings: of the file's 537 only 420 are distinct, so the same
 * text ("Consultoria Tecnologica" appears 15 times) always comes out the same in English.
 *
 *   node --experimental-strip-types scripts/translate-landings.mjs [--dry-run]
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { landingPagesData } from "../src/config/landing-pages-data.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const OUT = path.join(ROOT, "src/config/landing-pages-i18n.ts");
const CACHE = path.join(ROOT, "scripts/.landing-translations.json");

const MODEL = "claude-opus-5";
const BATCH_SIZE = 25;

const SYSTEM = `Traduces material de marketing del espanol al ingles para imSoft, una agencia mexicana de desarrollo de software.

AUDIENCIA DE DESTINO: duenos de empresa y directivos en Estados Unidos y Canada que evaluan a un proveedor de software. No son hispanohablantes.

REGLAS
- Ingles de negocio natural, no traduccion literal. Si una frase suena a traduccion, reescribela.
- Conserva sin traducir: "imSoft", y los nombres de ciudad Guadalajara, Monterrey. "Ciudad de Mexico" -> "Mexico City". "Zona Metropolitana de Guadalajara" -> "the Guadalajara metro area". Zapopan, Tlaquepaque, Tonala y demas municipios se quedan igual.
- Manten el registro: profesional y directo, primera persona plural ("we build", "we develop"). Sin jerga.
- Manten la longitud aproximada del original. Los titulos SEO no deben pasar de 60 caracteres antes del separador; las meta descripciones no deben pasar de 155 caracteres.
- Conserva la puntuacion estructural del original: si termina en interrogacion, la traduccion tambien; si es una lista de sintagmas nominales sin punto final, igual.
- Los terminos tecnicos van en su forma inglesa habitual: "expediente electronico" -> "electronic health records", "punto de venta" -> "point of sale", "tienda en linea" -> "online store", "paginas web" -> "websites", "analisis de datos" -> "data analytics".
- Nunca anadas ni quites informacion. Nada de comentarios ni notas.

Devuelves exactamente un elemento por cada cadena de entrada, en el mismo orden.`;

const client = new Anthropic();

/** Walks the tree and returns every translatable string (icons are not). */
function collectStrings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => collectStrings(v, out));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) if (k !== "icon") collectStrings(v, out);
  return out;
}

/** Rebuilds the tree replacing each string with its translation. */
function rebuild(node, dict) {
  if (typeof node === "string") return dict[node] ?? node;
  if (Array.isArray(node)) return node.map((v) => rebuild(v, dict));
  if (node && typeof node === "object")
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, k === "icon" ? v : rebuild(v, dict)])
    );
  return node;
}

async function translateBatch(strings) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    system: SYSTEM,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            translations: {
              type: "array",
              items: { type: "string" },
              description: "Una traduccion por cada cadena de entrada, en el mismo orden.",
            },
          },
          required: ["translations"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content:
          "Traduce al ingles cada una de estas cadenas:\n\n" +
          JSON.stringify(strings, null, 1),
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const { translations } = JSON.parse(text);
  if (!Array.isArray(translations) || translations.length !== strings.length) {
    throw new Error(
      `El modelo devolvio ${translations?.length} traducciones para ${strings.length} cadenas.`
    );
  }
  return translations;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const unique = [...new Set(collectStrings(landingPagesData))];
  console.log(`Cadenas unicas a traducir: ${unique.length}`);

  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
  const pending = unique.filter((s) => !cache[s]);
  console.log(`Ya en cache: ${unique.length - pending.length} | pendientes: ${pending.length}`);

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const n = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(pending.length / BATCH_SIZE);
    process.stdout.write(`  lote ${n}/${total} (${batch.length} cadenas)... `);
    const translated = await translateBatch(batch);
    batch.forEach((src, j) => (cache[src] = translated[j]));
    fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
    console.log("ok");
  }

  if (dryRun) {
    console.log("\n--dry-run: no se escribe el fichero de salida.");
    return;
  }

  const en = rebuild(landingPagesData, cache);
  const header = `import type { City, Industry, LandingPageData } from '@/types/landing-pages';
import { landingPagesData } from './landing-pages-data';

/**
 * English translations of the city + industry landings.
 *
 * GENERATED by scripts/translate-landings.mjs. To rewrite a text by hand, edit it
 * here and add the same fix to scripts/.landing-translations.json, the cache the
 * script uses so it does not translate again what is already done.
 *
 * While a combination is missing here, /en/<city>/<industry> canonicalizes to /es and
 * drops out of the English sitemap.
 */
export const landingPagesDataEn: Partial<Record<City, Partial<Record<Industry, LandingPageData>>>> =
${JSON.stringify(en, null, 2)};
`;
  const tail = fs.readFileSync(OUT, "utf8").split("export const landingPagesDataEn")[1];
  const rest = tail.slice(tail.indexOf("\n\nexport interface"));
  fs.writeFileSync(OUT, header + rest);
  console.log(`\nEscrito ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
