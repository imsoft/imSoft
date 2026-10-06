# Ficha de la app en App Store y Google Play

Textos y respuestas listos para pegar. Las capturas están en cada repositorio de la app
(`tienda/capturas/`): iPhone 6.9" (1320×2868) y Android (1280×2856). Android tiene además
`tienda/icono-512.png` y `tienda/grafico-destacado-1024x500.png`.

## Datos comunes

| Campo | Valor |
| --- | --- |
| Nombre | imSoft |
| Identificador | `io.imsoft.clientes` (bundle id en Apple, paquete en Android) |
| Categoría | Negocios (App Store: Business; Play: Negocios) |
| Idioma | Español (México); inglés no, la app está solo en español |
| Precio | Gratis, sin compras dentro de la app |
| Aviso de privacidad | https://www.imsoft.io/es/privacy-policy |
| Soporte | https://www.imsoft.io/es/contact |
| Correo de soporte | contacto@imsoft.io |
| Público | Clientes de imSoft con cuenta; no está dirigida a menores |

## App Store (App Store Connect)

- **Nombre (30):** imSoft
- **Subtítulo (30):** Tu proyecto, en tu teléfono
- **Texto promocional (170):** Sigue el avance de tu proyecto con imSoft, revisa tus cotizaciones y tus pagos, y recibe un aviso cuando terminemos una etapa.
- **Descripción:**

  imSoft es la app para los clientes de imSoft, empresa de desarrollo de software en Guadalajara. Si tienes un proyecto con nosotros, aquí lo sigues desde tu teléfono.

  QUÉ PUEDES HACER
  • Ver el estado y el avance de cada proyecto, tarea por tarea.
  • Revisar tus cotizaciones y abrirlas para aceptarlas en línea.
  • Consultar lo pagado y lo pendiente de cada proyecto, y pagar con tarjeta desde un enlace seguro.
  • Recibir avisos cuando terminemos una etapa o registremos un pago.
  • Escribirnos por WhatsApp desde la app.

  CÓMO ENTRAR
  Con el correo que registraste con imSoft te mandamos un código de acceso. También puedes entrar con tu cuenta de Apple o de Google si usan el mismo correo.

  La app es solo para clientes de imSoft. Si aún no tienes un proyecto con nosotros, escríbenos en imsoft.io.

- **Palabras clave (100):** imsoft,proyecto,cliente,software,desarrollo,cotización,pagos,avance,portal,guadalajara
- **URL de soporte:** https://www.imsoft.io/es/contact
- **URL de privacidad:** https://www.imsoft.io/es/privacy-policy
- **Copyright:** © 2026 imSoft
- **Clasificación por edad:** 4+ (ninguna de las preguntas aplica)
- **Cuenta para el revisor:** `demo-app@imsoft.io`. **Pendiente:** esa cuenta no recibe correo, así que hay que dejar un acceso fijo para el revisor antes de enviar a revisión (se decide cuando exista la cuenta de Apple Developer).
- **Notas para el revisor:**

  La app es el portal de clientes de imSoft; solo pueden entrar clientes con proyecto. Use la cuenta de demostración indicada: tiene un proyecto con tareas, una cotización y dos pagos. El pago con tarjeta abre una página web de Stripe fuera de la app, por eso no hay compras dentro de la app. "Eliminar mi cuenta" está en la pestaña Cuenta.

### Privacidad de la app (App Privacy)

Responder "Sí, recopilamos datos". Todos **vinculados a la identidad del usuario** y **no usados para rastreo**:

| Tipo de dato | Uso |
| --- | --- |
| Información de contacto > Dirección de correo | Funcionalidad de la app, gestión de la cuenta |
| Información de contacto > Nombre (solo si entra con Apple o Google) | Funcionalidad de la app |
| Identificadores > ID de usuario | Funcionalidad de la app |
| Identificadores > ID del dispositivo (token de notificaciones) | Funcionalidad de la app |
| Información financiera > Historial de pagos (lo que ve de sus propios pagos) | Funcionalidad de la app |

No se recopilan: ubicación, contactos, fotos, datos de uso ni diagnósticos. No hay SDK de analítica ni publicidad.

### Capacidades que pide

Push Notifications y Sign in with Apple (en el App ID y en el perfil de aprovisionamiento).

## Google Play (Play Console)

- **Nombre (30):** imSoft
- **Descripción breve (80):** Sigue tu proyecto con imSoft: avances, cotizaciones y pagos en tu teléfono.
- **Descripción completa:** la misma que en App Store (arriba), cambiando "cuenta de Apple o de Google" por "cuenta de Google".
- **Categoría:** Negocios. **Etiquetas:** Gestión de proyectos, Portal de clientes.
- **Correo del desarrollador:** contacto@imsoft.io. **Sitio:** https://www.imsoft.io
- **Política de privacidad:** https://www.imsoft.io/es/privacy-policy
- **Público objetivo:** 18 años o más (es una app de negocios; no está dirigida a niños).
- **Clasificación de contenido (cuestionario IARC):** categoría "Utilidad, productividad, comunicación u otros"; responder "No" a todo (sin violencia, sin contenido sexual, sin compras, sin interacción entre usuarios, sin ubicación).
- **Anuncios:** No contiene anuncios.
- **App de noticias / salud / financiera / gobierno:** No a todas. (Mostrar pagos no la vuelve "app financiera": no mueve dinero dentro de la app.)
- **Cuenta de prueba para la revisión:** `demo-app@imsoft.io` (mismo pendiente que en Apple: acceso fijo para el revisor).

### Seguridad de los datos (Data safety)

- ¿Recopila o comparte datos? **Sí.**
- ¿Se cifran en tránsito? **Sí.**
- ¿El usuario puede pedir que se borren? **Sí** (desde la app, pestaña Cuenta, o por correo).

| Tipo de dato | Recopilado | Compartido | Obligatorio | Finalidad |
| --- | --- | --- | --- | --- |
| Información personal > Dirección de correo | Sí | No | Sí | Funcionalidad de la app, gestión de la cuenta |
| Información personal > Nombre (solo con Google) | Sí | No | No | Funcionalidad de la app |
| Información personal > ID de usuario | Sí | No | Sí | Funcionalidad de la app |
| Información financiera > Historial de compras (sus pagos) | Sí | No | No | Funcionalidad de la app |
| ID de dispositivo u otros (token de notificaciones) | Sí | No | No | Funcionalidad de la app |

Supabase, Firebase y Stripe actúan como proveedores de servicio (no cuenta como "compartir" según Google).

### Firma y SHA-1

Al crear la app en Play Console con firma de Google Play, copiar la SHA-1 de "Integridad de la app > Firma de la app" y agregarla como segundo cliente Android en Google Cloud (`imsoft-482700`) y como huella en Firebase (`imsoft-9a0e8`). Sin eso, "Continuar con Google" no funciona en la versión de la tienda.

## Lista para el día de publicación

1. Cuenta de Apple Developer aprobada y cuenta de Google Play creada.
2. Apple: App ID `io.imsoft.clientes` con Push y Sign in with Apple; llave APNs (.p8) en Vercel (`APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY_P8`); Apple activado en Supabase.
3. Acceso fijo para el revisor con la cuenta demo.
4. Subir compilaciones: TestFlight y pista interna de Play. Probar en teléfonos reales: código por correo, Google, Apple, un aviso push y el pago.
5. Pegar los textos de este archivo, subir capturas, contestar privacidad y clasificación.
6. Enviar a revisión. Apple suele tardar 1 a 3 días; Google, hasta 7 la primera vez.
7. Después de publicar: cambiar los textos del sitio que hablan de "una base de código con React" y el artículo que menciona React Native; agregar la app al portafolio.
