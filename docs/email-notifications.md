# Sistema de Notificaciones por Email

## Descripción General

El sistema de notificaciones por email envía automáticamente correos electrónicos a los clientes cuando hay actualizaciones en sus proyectos. Actualmente, se envía una notificación cuando se completa una tarea del proyecto.

## Características

### Notificación de Tarea Completada

Cuando un administrador marca una tarea como completada en el dashboard, el sistema automáticamente:

1. **Detecta el cambio**: Verifica que la tarea pasó de no completada a completada
2. **Obtiene información del proyecto**: Recupera detalles del proyecto y del cliente
3. **Calcula progreso**: Determina el porcentaje de progreso actual del proyecto
4. **Envía email personalizado**: Envía un correo con diseño profesional al cliente

## Contenido del Email

El email incluye:

- **Saludo personalizado**: Con el nombre del cliente
- **Nombre del proyecto**: Título del proyecto actualizado
- **Tarea completada**: Descripción de la tarea que se completó
- **Barra de progreso**: Visual del progreso actual del proyecto
- **Estadísticas**: X de Y tareas completadas, porcentaje
- **Botón CTA**: Link directo al proyecto en el dashboard del cliente
- **Footer profesional**: Con información de imSoft

## Configuración

### Variables de Entorno Requeridas

```env
# Resend API Key (obtener en https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# URL del sitio (para links en emails)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Desarrollo
NEXT_PUBLIC_SITE_URL=https://imsoft.io      # Producción
```

### Configuración de Resend

1. **Crear cuenta en Resend**:
   - Ve a https://resend.com
   - Crea una cuenta o inicia sesión
   - Ve a "API Keys"
   - Crea una nueva API key
   - Copia la key y agrégala al archivo `.env`

2. **Configurar dominio (para producción)**:
   - En Resend Dashboard, ve a "Domains"
   - Agrega tu dominio: `imsoft.io`
   - Configura los registros DNS según las instrucciones
   - Verifica el dominio
   - Cambia el remitente en el código de `noreply@imsoft.io` a tu email verificado

3. **Dominio de Email**:
   - **Desarrollo**: Usa el dominio de prueba de Resend
   - **Producción**: Configura tu dominio personalizado (imsoft.io)

## Flujo Técnico

### 1. Actualización de Tarea
Cuando el admin actualiza una tarea vía API:

```
PATCH /api/projects/[id]/tasks/[taskId]
Body: { completed: true }
```

### 2. Verificación de Cambio de Estado
El endpoint verifica si:
- La tarea cambió de `completed: false` a `completed: true`
- Solo envía email en este caso (no si ya estaba completada)

### 3. Llamada Asíncrona al Servicio de Email
```typescript
fetch('/api/notifications/task-completed', {
  method: 'POST',
  body: JSON.stringify({
    projectId,
    taskId,
    taskTitle,
  })
})
```

### 4. Procesamiento del Email
El endpoint `/api/notifications/task-completed`:
1. Obtiene información del proyecto
2. Obtiene información del cliente (user_id de la empresa)
3. Calcula el progreso del proyecto
4. Envía el email vía Resend

## Estructura de Archivos

```
src/
├── app/
│   └── api/
│       ├── projects/
│       │   └── [id]/
│       │       └── tasks/
│       │           └── [taskId]/
│       │               └── route.ts          # Actualizado con lógica de email
│       └── notifications/
│           └── task-completed/
│               └── route.ts                  # Endpoint de envío de email
└── docs/
    └── email-notifications.md               # Esta documentación
```

## Diseño del Email

El email utiliza:
- **HTML responsive**: Compatible con todos los clientes de email
- **Tabla para layout**: Mejor compatibilidad con clientes antiguos
- **Gradientes**: Brand colors de imSoft (púrpura/azul)
- **Inline styles**: Para máxima compatibilidad
- **Barra de progreso**: Visual animada del porcentaje completado
- **Call to Action**: Botón prominente para ver el proyecto

### Colores del Brand
```css
/* Gradient principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Estados */
- Completado: #22c55e (verde)
- Pendiente: #f59e0b (naranja)
- Texto: #111827 (gris oscuro)
- Texto secundario: #6b7280 (gris medio)
```

## Pruebas

### Prueba Local
1. Asegúrate de tener el servidor de desarrollo corriendo:
   ```bash
   pnpm dev
   ```

2. Como admin, ve a un proyecto:
   ```
   http://localhost:3000/es/dashboard/admin/projects/[project-id]/edit
   ```

3. Marca una tarea como completada (checkbox)

4. Verifica:
   - La consola del servidor debe mostrar "Email sent successfully"
   - El cliente debe recibir el email en su inbox

### Verificar Email Enviado
- **Desarrollo**: Los emails se envían al email real del cliente
- **Resend Dashboard**: Ve a "Logs" para ver todos los emails enviados
- **Revisar errores**: Verifica la consola del servidor para errores

## Troubleshooting

### Error: "Unauthorized"
**Causa**: La API key de Resend no está configurada o es inválida
**Solución**:
1. Verifica que `RESEND_API_KEY` esté en `.env`
2. Verifica que la key sea válida en Resend Dashboard
3. Reinicia el servidor de desarrollo

### Error: "Client user not found"
**Causa**: El proyecto no tiene una empresa asociada o la empresa no tiene user_id
**Solución**:
1. Verifica que el proyecto tenga un `company_id`
2. Verifica que la empresa tenga un `user_id` válido

### Email no llega
**Causa**: Puede estar en spam o el email es inválido
**Solución**:
1. Verifica en Resend Dashboard → Logs si el email se envió
2. Revisa la carpeta de spam del cliente
3. Verifica que el email del usuario sea correcto en Supabase

### Error: "Failed to send email"
**Causa**: Error en la API de Resend o configuración incorrecta
**Solución**:
1. Verifica los logs del servidor para más detalles
2. Verifica que el dominio esté verificado (producción)
3. Verifica límites de envío en Resend (plan gratuito tiene límites)

## Límites y Consideraciones

### Resend Free Tier
- **100 emails/día**: Suficiente para desarrollo y proyectos pequeños
- **Dominio de prueba**: Funcional pero puede ir a spam
- **Sin verificación de dominio**: Emails desde onboarding@resend.dev

### Resend Paid Plans
- **Emails ilimitados**: Para producción
- **Dominio personalizado**: Mejor deliverability
- **Análisis avanzado**: Tracking de opens/clicks

## Próximas Mejoras

Posibles extensiones del sistema:

1. **Notificaciones adicionales**:
   - Nueva tarea agregada
   - Proyecto completado al 100%
   - Comentario nuevo en el proyecto
   - Actualización del estado del proyecto

2. **Preferencias del usuario**:
   - Permitir a clientes desactivar notificaciones
   - Configurar frecuencia (inmediata, diaria, semanal)
   - Elegir tipos de notificaciones

3. **Templates adicionales**:
   - Email de bienvenida
   - Resumen semanal de progreso
   - Recordatorios de tareas pendientes

4. **Internacionalización**:
   - Emails en español e inglés según preferencia del usuario
   - Detección automática del idioma

5. **Analytics**:
   - Tracking de apertura de emails
   - Clicks en CTAs
   - Engagement del cliente

## Seguridad

### Protección de Datos
- ✅ Emails solo a usuarios autenticados
- ✅ Solo admins pueden disparar notificaciones
- ✅ API key en variables de entorno (nunca en el código)
- ✅ Validación de ownership del proyecto

### Rate Limiting
Actualmente no implementado. Consideraciones:
- Resend tiene sus propios límites
- Implementar rate limiting si hay abuso
- Usar cola de emails para grandes volúmenes

## Soporte

Para problemas con el sistema de notificaciones:
1. Revisa esta documentación
2. Verifica Resend Dashboard → Logs
3. Revisa logs del servidor Next.js
4. Contacta soporte de Resend si es problema de deliverability

## Referencias

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [Email Best Practices](https://resend.com/docs/send-with-nodejs)
