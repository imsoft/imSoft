/**
 * Plantilla de correo de prospección (cold outreach).
 *
 * Fuente única para el admin (botón "Usar plantilla" en el envío por contacto).
 * Debe mantenerse en sincronía con scripts/prospects/template.html, que usa el
 * envío masivo por terminal.
 */

interface ProspectEmailParams {
  /** Nombre de pila del prospecto para el saludo. Si está vacío se usa "Hola,". */
  nombre?: string
  /** Empresa del prospecto para personalizar el asunto. */
  empresa?: string
}

/** Escapa texto interpolado en el HTML para evitar romper el markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Asunto de la plantilla, personalizado con la empresa si está disponible. */
export function buildProspectSubject(empresa?: string): string {
  const company = empresa?.trim()
  return company
    ? `Una idea para potenciar el software de ${company}`
    : 'Una idea para potenciar tu software'
}

/** Devuelve el asunto y el HTML listos para el formulario de envío. */
export function buildProspectEmail({ nombre, empresa }: ProspectEmailParams = {}): {
  subject: string
  html: string
} {
  const name = nombre?.trim()
  const greeting = name ? `Hola ${escapeHtml(name)},` : 'Hola,'

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto imSoft</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8f9fa;
            padding-top: 40px;
            padding-bottom: 40px;
        }
        .main-table {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border-radius: 12px;
            overflow: hidden;
        }
        .content {
            padding: 45px 40px;
            color: #2a2c35;
        }
        .title {
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
            color: #1a1c23;
            line-height: 1.2;
            text-align: center;
        }
        .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #2a2c35;
            margin-bottom: 20px;
        }
        .btn-container {
            text-align: center;
            margin-top: 28px;
            margin-bottom: 28px;
        }
        .btn-cta {
            background-color: #1e9df1;
            color: #ffffff !important;
            display: inline-block;
            padding: 14px 28px;
            font-size: 15px;
            font-weight: 700;
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(30, 157, 241, 0.2);
        }
        .cta-box {
            background-color: #e8f5fe;
            border-left: 4px solid #1e9df1;
            padding: 20px;
            margin-top: 30px;
            margin-bottom: 10px;
            border-radius: 0 8px 8px 0;
        }
        .cta-box p {
            margin: 0;
            font-size: 14px;
            color: #2a2c35;
        }
        .cta-box a {
            color: #1e9df1;
            font-weight: 700;
            text-decoration: underline;
        }
        .footer {
            padding: 30px 40px;
            background-color: #ffffff;
            border-top: 1px solid #edf0f7;
            font-size: 12px;
            color: #6b7280;
            text-align: left;
            line-height: 1.5;
        }
        .footer a {
            color: #1e9df1;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main-table" role="presentation">
            <tr>
                <td class="header" style="text-align: center; background-color: #1e9df1; padding: 20px 30px;">
                    <img src="https://imsoft.io/logos/logo-imsoft-white.png" alt="imSoft" style="height: 60px; width: auto; display: inline-block; border: 0;" />
                </td>
            </tr>

            <tr>
                <td class="content">
                    <h1 class="title">Transforma tu Infraestructura Digital</h1>

                    <p class="body-text">${greeting}</p>
                    <p class="body-text">
                        Sé que los correos en frío cansan, pero te prometo que esto te tomará menos de 60 segundos.
                    </p>
                    <p class="body-text">
                        Estuve revisando la presencia digital de tu empresa y noté algunas oportunidades clave para acelerar la velocidad de carga y optimizar la experiencia en tus flujos críticos.
                    </p>
                    <p class="body-text">
                        En <strong>imSoft</strong> nos dedicamos al diseño y desarrollo de software a medida, creando aplicaciones web robustas y soluciones de datos que escalan sin fricciones.
                    </p>

                    <div class="btn-container">
                        <a href="https://wa.me/523325365558?text=Hola%20Brandon%2C%20me%20interes%C3%B3%20el%20correo%20de%20imSoft%20y%20me%20gustar%C3%ADa%20platicar%20para%20conocer%20m%C3%A1s%20sobre%20tus%20soluciones%20de%20software%20a%20medida." class="btn-cta" target="_blank">Escríbeme por WhatsApp</a>
                    </div>

                    <p class="body-text">
                        ¿Tendrás 10 minutos esta semana para platicar sobre cómo podemos potenciar tu arquitectura tecnológica actual?
                    </p>

                    <div class="cta-box">
                        <p>Si prefieres visitar nuestro sitio web primero para ver nuestros proyectos, encuéntranos en <a href="https://imsoft.io">imsoft.io</a> o escríbenos directamente a <a href="mailto:contacto@imsoft.io">contacto@imsoft.io</a>.</p>
                    </div>
                </td>
            </tr>

            <tr>
                <td class="footer">
                    <p><strong>imSoft | Agencia de Soluciones Digitales</strong></p>
                    <p>Web: <a href="https://imsoft.io">imsoft.io</a> | Teléfono: 33 2536 5558</p>
                    <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">Este correo es de carácter profesional. Si no deseas recibir más comunicaciones, puedes solicitar tu baja respondiendo directamente a este correo con la palabra "BAJA".</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`

  return { subject: buildProspectSubject(empresa), html }
}
