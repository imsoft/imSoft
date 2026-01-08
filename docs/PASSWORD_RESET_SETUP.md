# Configuración de Reset de Contraseña

Esta guía explica cómo configurar el sistema de recuperación de contraseña en tu aplicación.

## Funcionalidad Implementada

El sistema de reset de contraseña incluye:

1. **Página de "Olvidé mi contraseña"** (`/[lang]/forgot-password`)
   - El usuario ingresa su email
   - Se envía un email con un enlace de recuperación

2. **Página de reset de contraseña** (`/[lang]/reset-password`)
   - El usuario hace clic en el enlace del email
   - Ingresa su nueva contraseña
   - La contraseña se actualiza

## Configuración en Supabase

### Paso 1: Configurar URL de Redirect

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega las siguientes URLs:

**Para desarrollo:**
```
http://localhost:3000/es/reset-password
http://localhost:3000/en/reset-password
```

**Para producción:**
```
https://imsoft.io/es/reset-password
https://imsoft.io/en/reset-password
```

### Paso 2: Configurar Email Templates (Opcional)

Si quieres personalizar los emails de recuperación:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. Personaliza el template HTML
4. Asegúrate de que el enlace incluya `{{ .ConfirmationURL }}`

### Paso 3: Verificar SMTP

Asegúrate de que el SMTP esté configurado correctamente (ver `docs/SUPABASE_SMTP_SETUP.md`).

## Flujo de Usuario

1. **Usuario olvida su contraseña:**
   - Va a `/es/login` o `/en/login`
   - Hace clic en "¿Olvidaste tu contraseña?"
   - Es redirigido a `/es/forgot-password` o `/en/forgot-password`

2. **Solicita reset:**
   - Ingresa su email
   - Hace clic en "Enviar enlace de recuperación"
   - Recibe un mensaje de confirmación (por seguridad, siempre se muestra éxito)

3. **Recibe el email:**
   - Supabase envía un email con un enlace de recuperación
   - El enlace incluye un token de recuperación

4. **Resetea la contraseña:**
   - Hace clic en el enlace del email
   - Es redirigido a `/es/reset-password` o `/en/reset-password` con el token
   - Ingresa su nueva contraseña dos veces
   - Hace clic en "Restablecer contraseña"
   - Es redirigido al login

## Seguridad

- **No se revela si el email existe**: Por seguridad, siempre se muestra el mismo mensaje de éxito
- **Token con expiración**: Los tokens de recuperación expiran después de un tiempo (configurable en Supabase)
- **Validación de contraseña**: La nueva contraseña debe tener al menos 6 caracteres
- **Confirmación de contraseña**: Se valida que ambas contraseñas coincidan

## Variables de Entorno

Asegúrate de tener configurado:

```env
NEXT_PUBLIC_SITE_URL=https://imsoft.io  # Para producción
# o
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Para desarrollo
```

Esta variable se usa para construir la URL de redirect en el email.

## Troubleshooting

### El email no llega

1. Verifica que el SMTP esté configurado correctamente
2. Revisa los logs de Supabase: **Authentication** → **Logs**
3. Verifica que el email no esté en spam
4. Asegúrate de que la URL de redirect esté en la lista de URLs permitidas

### El enlace no funciona

1. Verifica que la URL de redirect esté configurada en Supabase
2. Asegúrate de que `NEXT_PUBLIC_SITE_URL` esté configurado correctamente
3. Verifica que el token no haya expirado (intenta solicitar un nuevo reset)

### Error "Invalid token"

1. El token puede haber expirado (solicita un nuevo reset)
2. El token puede haber sido usado ya (cada token solo se puede usar una vez)
3. Verifica que la URL de redirect en Supabase coincida exactamente con la URL de tu aplicación

## Personalización

### Cambiar el tiempo de expiración del token

1. Ve a **Authentication** → **Settings**
2. Busca **Email Auth** → **Token expiry**
3. Ajusta el tiempo (por defecto es 1 hora)

### Personalizar el email

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. Edita el template HTML
4. Usa `{{ .ConfirmationURL }}` para el enlace de recuperación

## Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
