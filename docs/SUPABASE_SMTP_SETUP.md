# Configuración de SMTP en Supabase

Esta guía te ayudará a configurar SMTP personalizado en Supabase para que los emails de autenticación (confirmación de email, reset de contraseña, etc.) se envíen desde tu propio servidor SMTP.

## ¿Por qué configurar SMTP personalizado?

- **Mejor deliverability**: Los emails desde tu dominio tienen mejor reputación
- **Branding**: Los emails aparecen desde tu dominio (ej: `noreply@imsoft.io`)
- **Control**: Puedes monitorear y gestionar los emails desde tu proveedor SMTP
- **Límites**: Evitas los límites del SMTP por defecto de Supabase

## Opción 1: Resend SMTP (Recomendado)

Ya estás usando Resend para emails de la aplicación, así que es la opción más coherente.

### Paso 1: Obtener credenciales SMTP de Resend

1. Ve a [Resend Dashboard](https://resend.com)
2. Inicia sesión con tu cuenta
3. Ve a **Settings** → **SMTP**
4. Copia las credenciales SMTP

### Paso 2: Configurar en Supabase

En la página de configuración de SMTP de Supabase, completa los siguientes campos:

#### Sender details
- **Sender email address**: `noreply@imsoft.io` (o el email que configuraste en Resend)
- **Sender name**: `imSoft`

#### SMTP provider settings
- **Host**: `smtp.resend.com`
- **Port number**: `465` (recomendado por Resend - SSL/TLS implícito)
- **Minimum interval per user**: `60` (segundos)
- **Username**: `resend` (siempre es "resend" para Resend)
- **Password**: Tu API key de Resend (empieza con `re_...`)

### Credenciales Resend SMTP

```
Host: smtp.resend.com
Port: 465 (SSL/TLS implícito - RECOMENDADO)
Username: resend
Password: re_xxxxxxxxxxxxx (tu API key de Resend)
```

**Nota**: Resend recomienda el puerto **465** para conexión SSL/TLS implícita. El puerto 587 también funciona pero 465 es la opción preferida.

## Opción 2: SendGrid SMTP

Si prefieres usar SendGrid:

### Credenciales SendGrid SMTP

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SG.xxxxxxxxxxxxx (tu API key de SendGrid)
```

### Configuración en Supabase:
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **Username**: `apikey`
- **Password**: Tu API key de SendGrid (empieza con `SG.`)

## Opción 3: Gmail / Google Workspace SMTP

⚠️ **Nota**: Gmail tiene límites estrictos y puede requerir "App Passwords" para SMTP.

### Credenciales Gmail SMTP

```
Host: smtp.gmail.com
Port: 587 (TLS) o 465 (SSL)
Username: tu-email@gmail.com
Password: App Password (no tu contraseña normal)
```

### Configuración en Supabase:
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Username**: Tu email completo
- **Password**: App Password (generar en Google Account → Security → App Passwords)

## Opción 4: Mailgun SMTP

### Credenciales Mailgun SMTP

```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@tu-dominio.mailgun.org
Password: tu-password-de-mailgun
```

## Configuración Completa en Supabase

### Campos requeridos:

1. **Enable custom SMTP**: Activar el toggle (solo después de llenar todos los campos)

2. **Sender details**:
   - **Sender email address**: `noreply@imsoft.io`
   - **Sender name**: `imSoft`

3. **SMTP provider settings**:
   - **Host**: Depende del proveedor (ver arriba)
   - **Port number**: 
     - **Resend**: `465` (recomendado - SSL/TLS implícito)
     - **Otros proveedores**: `465` (SSL) o `587` (TLS)
   - **Minimum interval per user**: `60` segundos (recomendado)
   - **Username**: Depende del proveedor
   - **Password**: Tu credencial SMTP

### ⚠️ Importante:

- **Todos los campos deben estar llenos** antes de activar "Enable custom SMTP"
- El password se encripta en la base de datos de Supabase
- Una vez guardado, el password no se puede ver (solo cambiar)
- El límite de rate limit se aumenta a 30 emails/minuto al activar SMTP personalizado

## Verificación

Después de configurar:

1. **Guarda los cambios** en Supabase
2. **Prueba el envío**:
   - Ve a Authentication → Users
   - Crea un usuario de prueba o resetea la contraseña de uno existente
   - Verifica que el email llegue desde tu dominio configurado
3. **Revisa los logs**:
   - En Resend: Dashboard → Logs
   - En Supabase: Authentication → Logs

## Troubleshooting

### Error: "All fields must be filled"
- Asegúrate de que todos los campos estén completos antes de activar el toggle

### Los emails no llegan
1. Verifica que el dominio esté verificado en tu proveedor SMTP (Resend/SendGrid)
2. Revisa los logs de tu proveedor SMTP
3. Verifica que el email del remitente esté autorizado
4. Revisa la carpeta de spam

### Error de autenticación SMTP
1. Verifica que el username y password sean correctos
2. Para Gmail, asegúrate de usar App Password, no la contraseña normal
3. Verifica que el puerto sea correcto (465 para SSL, 587 para TLS)

### Emails van a spam
1. Configura SPF, DKIM y DMARC en tu dominio
2. Verifica el dominio en tu proveedor SMTP
3. Usa un dominio personalizado (no Gmail genérico)

## Recomendación Final

**Usa Resend SMTP** porque:
- ✅ Ya lo tienes configurado en tu proyecto
- ✅ API key fácil de obtener
- ✅ Buena deliverability
- ✅ Dashboard con logs y analytics
- ✅ Plan gratuito generoso (100 emails/día)

## Referencias

- [Resend SMTP Documentation](https://resend.com/docs/send-with-smtp)
- [Supabase SMTP Settings](https://supabase.com/docs/guides/auth/auth-smtp)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
