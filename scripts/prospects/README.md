# Correos de prospección (cold outreach)

Envía la plantilla `template.html` personalizada a una lista de prospectos usando
**Resend** (ya instalado en el proyecto). El script vive en
[`scripts/send-prospects.mjs`](../send-prospects.mjs).

---

## 1. Requisitos previos (una sola vez)

### a) Verificar el dominio en Resend
Para enviar como `contacto@imsoft.io` debes verificar `imsoft.io` en Resend:

1. Entra a <https://resend.com> → **Domains** → **Add Domain** → `imsoft.io`.
2. Resend te da registros **DNS** (SPF, DKIM, y opcional DMARC). Agrégalos donde
   administres el DNS de `imsoft.io` (Vercel, Cloudflare, GoDaddy, etc.).
   - El **DKIM de Resend** convive sin problema con el de Google Workspace
     (usan selectores distintos), así que **no afecta** tu correo entrante de
     `contacto@imsoft.io`.
   - En el registro **SPF** ya existente de Google, añade el `include` de Resend
     si Resend te lo pide (no crees un segundo registro SPF: edita el que ya tienes).
3. Espera a que Resend marque el dominio como **Verified** (minutos a unas horas).

> 💡 **Recomendación de entregabilidad:** para proteger la reputación de tu
> dominio principal, considera enviar la prospección desde un **subdominio**
> (p. ej. `contacto@send.imsoft.io`) y deja `@imsoft.io` solo para correo legítimo
> 1‑a‑1. Si prefieres usar `contacto@imsoft.io` directo, está bien para 50–500/mes,
> solo cuida el volumen y los rebotes.

### b) Variables de entorno (ya están en `.env`)
```
RESEND_API_KEY=...           # tu API key de Resend
RESEND_FROM_EMAIL=contacto@imsoft.io
```

---

## 2. Preparar la lista

Crea `scripts/prospects/prospects.csv` (este archivo está en `.gitignore`, no se sube).
Mínimo necesita las columnas **`nombre`** y **`email`**. Puedes añadir más columnas
(p. ej. `empresa`) y usarlas como placeholders `{{empresa}}` en la plantilla o el asunto.

```csv
nombre,email,empresa
Ana López,ana@ejemplo.com,Ejemplo SA
Carlos Ruiz,carlos@otraempresa.mx,Otra Empresa
```

Hay un ejemplo en [`prospects.example.csv`](./prospects.example.csv).

---

## 3. Probar SIN enviar (dry-run)

Siempre corre primero con `--dry-run`: valida la lista, detecta correos inválidos
y duplicados, y genera `preview.html` con el primer correo renderizado para que lo
abras en el navegador.

```bash
node --env-file=.env scripts/send-prospects.mjs \
  --list scripts/prospects/prospects.csv \
  --subject "Una idea para optimizar el sitio de {{empresa}}" \
  --dry-run
```

---

## 4. Enviar de verdad

Quita `--dry-run`. Recomendado empezar con `--limit` pequeño para una prueba real
a tu propio correo o a unos pocos contactos.

```bash
# Prueba real con 1 correo (ponte a ti en el CSV)
node --env-file=.env scripts/send-prospects.mjs \
  --list scripts/prospects/prospects.csv \
  --subject "Una idea para optimizar el sitio de {{empresa}}" \
  --limit 1

# Campaña completa
node --env-file=.env scripts/send-prospects.mjs \
  --list scripts/prospects/prospects.csv \
  --subject "Una idea para optimizar el sitio de {{empresa}}"
```

El script lleva un registro en `sent-log.csv` (también ignorado por git). Si vuelves
a correrlo, **no reenvía** a quien ya recibió el correo (`status = sent`). Usa
`--resend` solo si quieres forzar el reenvío.

---

## 5. Flags disponibles

| Flag | Default | Descripción |
|------|---------|-------------|
| `--list <ruta>` | — | CSV de prospectos (**requerido**). Columnas `nombre`, `email`. |
| `--template <ruta>` | `scripts/prospects/template.html` | Plantilla HTML. |
| `--subject <texto>` | *(genérico)* | Asunto. Admite placeholders `{{...}}`. |
| `--from <correo>` | `RESEND_FROM_EMAIL` | Remitente (debe estar verificado en Resend). |
| `--from-name <texto>` | `imSoft` | Nombre visible del remitente. |
| `--reply-to <correo>` | igual que `--from` | Dirección de respuesta. |
| `--delay <ms>` | `700` | Pausa entre envíos (respeta el rate limit de Resend). |
| `--limit <n>` | ∞ | Máximo de correos en esta corrida. |
| `--log <ruta>` | `scripts/prospects/sent-log.csv` | Registro de enviados. |
| `--default-nombre <t>` | `""` | Texto si una fila no trae nombre. |
| `--dry-run` | — | No envía; valida y genera `preview.html`. |
| `--resend` | — | Ignora el registro y reenvía. |

---

## 6. Buenas prácticas (importante)

- **No compres listas.** Usa prospectos que tengan relación lógica con tu servicio.
- **Calienta el volumen:** empieza con pocos correos al día y sube gradualmente.
- **Personaliza el asunto** con `{{empresa}}` o `{{nombre}}`; mejora aperturas y evita spam.
- **Respeta las bajas:** quien responda "BAJA" debe salir de futuras listas (la
  plantilla y el header `List-Unsubscribe` ya invitan a darse de baja).
- **Marco legal (México · LFPDPPP / CAN-SPAM):** identifica claramente al remitente,
  ofrece la baja y no ocultes que es comunicación comercial. La plantilla ya cumple
  esos puntos.
