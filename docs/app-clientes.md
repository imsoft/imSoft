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
| Entrar | Correo y contraseña, o enlace mágico. Sin registro: las cuentas las crea imSoft. | Supabase Auth |
| Mis proyectos | Lista con estado y avance; al abrir uno: tareas hechas y pendientes, fechas, enlace a recursos. | `projects`, `project_tasks` |
| Pagos | Por proyecto: total, pagado, pendiente; cada pago con fecha y estado; botón para pagar un pendiente (abre el enlace de pago en el navegador). | `project_payments` |
| Cuenta | Datos de la empresa, cerrar sesión, **eliminar cuenta** (lo exige Apple), aviso de privacidad. | `companies`, Auth |

Fuera de la primera versión, a propósito: mensajes, cotizaciones dentro de la app,
notificaciones push y modo sin conexión. Se agregan cuando se vea qué usan los clientes.

## Cómo se construye

- **iPhone:** SwiftUI, iOS 17 o superior, `supabase-swift`. Sin dependencias extra.
- **Android:** Kotlin con Jetpack Compose, `supabase-kt`.
- **Misma estructura en las dos:** una capa de datos (sesión + consultas), un modelo por
  tabla y una vista por pantalla, con los mismos nombres. Así un cambio se replica leyendo
  un archivo y escribiendo su gemelo.
- **Sin servidor propio:** las apps leen de Supabase con la sesión del cliente. Lo único que
  pasa por imsoft.io es el pago (el enlace `/pagar/…` que ya existe).
- **Orden:** primero iPhone completa y publicada; después Android con lo aprendido.
- **Repositorio:** aparte de este (`imsoft-app-ios`, `imsoft-app-android`), privados.

## Seguridad: pendiente antes de la app

Comprobado el 4-oct-2026 con la llave pública, sin sesión:

- `companies` se puede leer sin iniciar sesión (nombre, logo y `user_id` de las 22 empresas).
  Si es intencional para mostrar logos en el sitio, conviene exponer solo nombre y logo.
- `project_payments` responde "permission denied for table users": su política consulta la
  tabla de usuarios de Auth, que un cliente tampoco puede leer. Es probable que un cliente
  con sesión reciba ese mismo error al ver sus pagos, también en la web. No se ha podido
  comprobar porque no existe ningún usuario cliente.
- `projects` y `project_tasks` están vacías, así que no se pudo ver qué dejan leer.
- `quotes` solo tiene política de administrador: un cliente no puede leer sus cotizaciones
  desde la app; hoy las ve por el enlace público con token.

Las políticas de estas tablas no están en `supabase/migrations` (se crearon desde el panel).
Para revisarlas hace falta su definición actual:

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('projects', 'project_tasks', 'project_payments', 'companies', 'quotes', 'contact_messages')
order by tablename, policyname;
```

La regla que deben cumplir: un cliente solo lee filas de proyectos cuya empresa
(`companies.user_id`) es él mismo; el administrador lee y escribe todo.

## Requisitos de las tiendas

- Aviso de privacidad público (ya existe en el sitio) y enlace dentro de la app.
- Eliminación de cuenta desde la app.
- Cuenta de prueba con datos para el revisor de Apple.
- Capturas de pantalla, icono e identificador (`io.imsoft.clientes`).
