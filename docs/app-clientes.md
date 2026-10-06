# App de clientes de imSoft (iPhone y Android, nativa)

Decidido por Brandon el 4-oct-2026: app **nativa**, Swift para iPhone y Kotlin para Android.
Sirve a dos fines: que los clientes sigan su proyecto desde el teléfono, y ser la muestra de
app publicada en tiendas que hoy falta en el portafolio. El mantenimiento lo hace Claude con
Brandon, así que el código debe ser simple y parecido entre las dos plataformas.

## Antes de escribir código

1. **El portal tiene que tener datos.** Al 4-oct-2026 hay 0 clientes con cuenta, 0 proyectos
   y 0 pagos ligados a proyectos. Primero se convierte la cotización aceptada en proyecto y
   se invita a ese cliente al portal web. Apple además exige una cuenta de prueba con
   contenido real para revisar la app.
2. **Reglas de acceso de la base (RLS).** La web filtra por empresa dentro de cada consulta;
   una app nativa habla directo con Supabase, así que la protección debe estar en las
   políticas de la base. Hay que revisarlas y corregirlas antes de la app (ver "Seguridad").
3. **Cuentas de las tiendas.** Apple Developer Program (cuota anual; tarda días en aprobarse)
   y Google Play Console (pago único). Ambas a nombre de Brandon.

## Primera versión: cuatro pantallas

| Pantalla | Qué muestra | De dónde sale |
| --- | --- | --- |
| Entrar | Correo y código de 8 dígitos que llega por correo (`POST /api/app/login`; el captcha del sitio impide usar contraseña desde la app). Sin registro: las cuentas las crea imSoft. | imsoft.io + Supabase Auth |
| Mis proyectos | Lista con estado y avance; al abrir uno: tareas hechas y pendientes, fechas, enlace a recursos. | `projects`, `project_tasks` |
| Pagos | Por proyecto: total, pagado, pendiente; cada pago con fecha y estado; botón para pagar un pendiente (abre el enlace de pago en el navegador). | `project_payments` |
| Cuenta | Datos de la empresa, cerrar sesión, **eliminar cuenta** (lo exige Apple), aviso de privacidad. | `companies`, Auth |

Fuera de la primera versión, a propósito: mensajes, cotizaciones dentro de la app,
notificaciones push y modo sin conexión. Se agregan cuando se vea qué usan los clientes.

## Cómo se construye

- **iPhone:** SwiftUI, iOS 17 o superior. Proyecto generado con XcodeGen (`project.yml`).
- **Android:** Kotlin con Jetpack Compose, minSdk 26.
- **Sin SDK de Supabase:** las dos hablan con la API REST y Auth de Supabase con lo que trae
  cada plataforma (URLSession / HttpURLConnection). Menos dependencias que mantener.
- **Misma estructura en las dos:** una capa de datos (sesión + consultas), un modelo por
  tabla y una vista por pantalla, con los mismos nombres. Así un cambio se replica leyendo
  un archivo y escribiendo su gemelo.
- **Por imsoft.io pasan solo tres cosas:** pedir el código (`/api/app/login`, con límite de
  1 por minuto y 5 por hora por cuenta), eliminar la cuenta (`DELETE /api/app/cuenta`) y el
  pago (el enlace `/pagar/…` que ya existe). Los datos se leen directo de Supabase con la
  sesión del cliente; la sesión se guarda cifrada (Keychain / Android Keystore).
- **Repositorios:** aparte de este, en `~/Proyectos/imSoft/aplicaciones-moviles/`
  (`imsoft-clientes-ios`, `imsoft-clientes-android`), locales por ahora; al subirlos, privados.
- **Cuenta de demostración:** `demo-app@imsoft.io`, con una empresa y un proyecto marcados como
  demostración, 7 tareas y 2 pagos. Sirve para capturas y para el revisor de las tiendas.
  Pendiente: el revisor de Apple no puede recibir el código por correo; hace falta una forma
  de entrar para esa cuenta (por ejemplo un código fijo configurado en el servidor).
- **Capturas desde la terminal:** las compilaciones de desarrollo aceptan variables
  (`IMSOFT_DEBUG_EMAIL`/`IMSOFT_DEBUG_CODIGO`/`IMSOFT_DEBUG_PESTANA` en iOS vía `SIMCTL_CHILD_`,
  extras `email`/`codigo`/`pestana` en Android vía `am start`) para abrirse ya con sesión. El
  código se obtiene con `auth.admin.generateLink` (`properties.email_otp`).

## Estado al 5-oct-2026

Las dos apps están completas en su primera versión, compiladas y probadas con la cuenta de
demostración (10 pruebas unitarias cada una). Falta: cuentas de las tiendas, firmar, subir,
capturas finales y la ficha de cada tienda.

## Seguridad: revisada el 5-oct-2026

Al revisar las políticas apareció un problema mayor que los permisos de la app: el rol de
administrador se leía de `user_metadata`, que el propio usuario puede cambiar, y el registro
está abierto. Cualquiera que se registrara podía volverse administrador. Se comprobó con un
usuario de prueba (eliminado después): pasó a leer los 378 contactos del CRM.

- **Código (desplegado):** `src/lib/roles.ts` es el único lugar que decide el rol, desde
  `app_metadata`, que solo escribe el servidor.
- **Base de datos (la aplica Brandon):** `supabase/migrations/20261005_roles_app_metadata.sql`.
  Cambia `is_admin()` a `app_metadata`, pasa a `is_admin()` las políticas que leían el rol
  por su cuenta (cotizaciones, pagos, prospección…), cierra los mensajes de contacto (antes
  cualquier usuario con sesión los leía todos) y quita a los clientes el permiso de editar
  o borrar proyectos. Probada en un Postgres local con las mismas políticas.
- Con eso un cliente lee solo sus proyectos, tareas y pagos, que es lo que la app necesita.
  El error "permission denied for table users" al leer pagos queda resuelto.
- Sigue abierto: `companies` se puede leer sin sesión (nombre y logo de las empresas), y un
  cliente no puede leer sus cotizaciones desde la app (solo por el enlace público).

## Requisitos de las tiendas

- Aviso de privacidad público (ya existe en el sitio) y enlace dentro de la app.
- Eliminación de cuenta desde la app.
- Cuenta de prueba con datos para el revisor de Apple.
- Capturas de pantalla, icono e identificador (`io.imsoft.clientes`).
