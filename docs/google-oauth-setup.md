# Configuración de Google OAuth y Sincronización de Usuarios

Este documento explica cómo está configurado el sistema para que los usuarios que se registren con Google tengan la misma información guardada que los que se registran con email y contraseña.

## 📋 Resumen

Cuando un usuario se registra con Google OAuth:
1. Google proporciona información básica (nombre, email, foto de perfil)
2. El callback de autenticación extrae y estructura esta información
3. Se guarda en `user_metadata` con el mismo formato que el registro tradicional
4. El usuario se asigna automáticamente como 'client'

## 🔧 Componentes del Sistema

### 1. Script SQL de Sincronización (Opcional)

**Archivo**: `/scripts/sync-google-oauth-users.sql`

Este script crea un trigger en Supabase que automáticamente procesa la metadata cuando un usuario de Google se registra. **Es opcional** pero puede ser útil si quieres que la sincronización ocurra a nivel de base de datos.

**Para ejecutarlo**:
1. Ve a tu proyecto de Supabase
2. Navega a SQL Editor
3. Copia y pega el contenido del archivo
4. Ejecuta el script

### 2. Callback de Autenticación (Principal)

**Archivo**: `/src/app/[lang]/auth/callback/route.ts`

Este es el componente **principal** que maneja el registro de usuarios de Google.

**Flujo de trabajo**:
1. Usuario hace clic en "Continuar con Google"
2. Google autentica y redirige a /auth/callback
3. Se intercambia el código por una sesión
4. Se verifica si es un nuevo usuario de Google
5. Si es nuevo, se extrae y guarda toda la información
6. Se redirige al dashboard apropiado

## 📊 Estructura de Datos

### Usuario de Google OAuth
```json
{
  "role": "client",
  "full_name": "Brandon Garcia",
  "first_name": "Brandon",
  "last_name": "Garcia",
  "company_name": "",
  "avatar_url": "https://lh3.googleusercontent.com/..."
}
```

### Usuario con Email/Contraseña
```json
{
  "role": "client",
  "full_name": "Brandon Garcia",
  "first_name": "Brandon",
  "last_name": "Garcia",
  "company_name": "imSoft"
}
```

## 🧪 Cómo Probar

1. Ve a `/signup` o `/login`
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Verifica en Supabase → Authentication → Users
5. Revisa el User Metadata del usuario creado

## ✅ Pasos Completados

- ✅ Callback actualizado para extraer nombre completo
- ✅ División automática de first_name y last_name
- ✅ Asignación de rol 'client' por defecto
- ✅ Guardado de avatar_url de Google
- ✅ Campo company_name inicializado (vacío)
- ✅ Script SQL opcional para sincronización en DB

