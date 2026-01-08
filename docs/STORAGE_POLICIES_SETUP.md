# Configuración de Políticas de Storage en Supabase

Esta guía explica cómo configurar las políticas RLS (Row Level Security) para buckets de Supabase Storage desde la interfaz web.

## ¿Por qué usar la interfaz web?

Las políticas de Storage requieren permisos de administrador para crearse con SQL. La interfaz web de Supabase permite configurarlas sin necesidad de permisos especiales.

## Configurar Políticas para `company-logos`

### Paso 1: Acceder a las Políticas

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Storage** en el menú lateral
3. Haz clic en el bucket `company-logos` (o ve a **Policies** directamente)
4. Haz clic en la pestaña **Policies**

### Paso 2: Crear Política de Lectura Pública

1. Haz clic en **New Policy** o **Create Policy**
2. Selecciona **For full customization** (o la opción que te permita escribir SQL)
3. Configura:
   - **Policy name**: `Public Access for company-logos`
   - **Allowed operation**: `SELECT`
   - **Policy definition** (SQL):
     ```sql
     bucket_id = 'company-logos'
     ```
4. Haz clic en **Save** o **Create Policy**

### Paso 3: Crear Política de Subida

1. Haz clic en **New Policy** nuevamente
2. Configura:
   - **Policy name**: `Authenticated users can upload to company-logos`
   - **Allowed operation**: `INSERT`
   - **Policy definition** (SQL):
     ```sql
     bucket_id = 'company-logos' AND auth.role() = 'authenticated'
     ```
3. Haz clic en **Save**

### Paso 4: Crear Política de Actualización

1. Haz clic en **New Policy**
2. Configura:
   - **Policy name**: `Authenticated users can update their own files in company-logos`
   - **Allowed operation**: `UPDATE`
   - **Policy definition** (SQL):
     ```sql
     bucket_id = 'company-logos' AND auth.role() = 'authenticated'
     ```
3. Haz clic en **Save**

### Paso 5: Crear Política de Eliminación

1. Haz clic en **New Policy**
2. Configura:
   - **Policy name**: `Authenticated users can delete their own files in company-logos`
   - **Allowed operation**: `DELETE`
   - **Policy definition** (SQL):
     ```sql
     bucket_id = 'company-logos' AND auth.role() = 'authenticated'
     ```
3. Haz clic en **Save**

## Verificar las Políticas

Después de crear todas las políticas, deberías ver 4 políticas en la lista:

1. ✅ Public Access for company-logos (SELECT)
2. ✅ Authenticated users can upload to company-logos (INSERT)
3. ✅ Authenticated users can update their own files in company-logos (UPDATE)
4. ✅ Authenticated users can delete their own files in company-logos (DELETE)

## Notas Importantes

- Si el bucket es **público**, la política de SELECT puede no ser estrictamente necesaria, pero es recomendable tenerla para mayor control
- Las políticas de UPDATE y DELETE permiten que cualquier usuario autenticado actualice/elimine cualquier archivo en el bucket. Si necesitas restricciones más estrictas (solo sus propios archivos), necesitarías políticas más complejas basadas en el ownership del archivo
- Para la mayoría de casos de uso, esta configuración es suficiente

## Solución de Problemas

### Error: "must be owner of relation objects"

Este error ocurre cuando intentas crear políticas con SQL sin permisos de administrador. **Solución**: Usa la interfaz web como se describe arriba.

### Las imágenes no se muestran

1. Verifica que el bucket sea **público** (Public bucket: ON)
2. Verifica que la política de SELECT esté creada
3. Verifica que la URL del logo sea correcta (debe incluir el dominio de Supabase)

### No puedo subir imágenes

1. Verifica que estés autenticado
2. Verifica que la política de INSERT esté creada
3. Verifica que el tamaño del archivo no exceda el límite configurado (5MB recomendado)

