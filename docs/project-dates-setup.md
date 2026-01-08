# Configuración de Fechas de Proyecto

Este documento explica cómo agregar las columnas de fecha de inicio y fecha de entrega a la tabla `projects` en Supabase.

## 📋 Resumen

Las fechas de proyecto permiten:
- Establecer una fecha de inicio para el proyecto
- Definir una fecha de entrega estimada
- Mostrar una cuenta regresiva en tiempo real en el dashboard del cliente
- Dar visibilidad al cliente sobre el tiempo restante hasta la entrega

## 🚀 Instalación

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `/scripts/add-project-dates.sql`
5. Ejecuta el script (botón "Run" o `Ctrl/Cmd + Enter`)

El script agregará las siguientes columnas a la tabla `projects`:
- `start_date` (tipo: `date`) - Fecha de inicio del proyecto
- `end_date` (tipo: `date`) - Fecha de entrega estimada del proyecto

### Paso 2: Verificar la Instalación

Para verificar que las columnas se agregaron correctamente, ejecuta esta query:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects'
AND column_name IN ('start_date', 'end_date');
```

Deberías ver:
```
| column_name | data_type |
|-------------|-----------|
| start_date  | date      |
| end_date    | date      |
```

## 📖 Uso

### Dashboard de Admin

1. Ve a **Proyectos** → **Crear Nuevo** o **Editar Proyecto**
2. Encontrarás dos nuevos campos opcionales:
   - **Fecha de Inicio** - Cuando comienza el proyecto
   - **Fecha de Entrega** - Cuando se espera entregar el proyecto
3. Los campos son opcionales, pero se recomienda establecer al menos la fecha de entrega

### Dashboard del Cliente

Cuando un proyecto tiene configurada una fecha de entrega:

1. En la página de detalle del proyecto, el cliente verá:
   - **Cuenta Regresiva en Tiempo Real**: Un widget que muestra días, horas, minutos y segundos hasta la entrega
   - **Fechas en Información del Proyecto**: Fecha de inicio y fecha de entrega formateadas

2. La cuenta regresiva:
   - Se actualiza cada segundo automáticamente
   - Muestra un mensaje cuando la fecha ya ha pasado
   - Es visible y prominente para mantener al cliente informado

## 🎨 Características

### Cuenta Regresiva

El componente `ProjectCountdown` muestra:

```
┌────────────────────────────────────────┐
│ 🗓️  Cuenta Regresiva del Proyecto      │
├────────────────────────────────────────┤
│                                        │
│   15      12      45      32          │
│  Días   Horas  Minutos Segundos       │
│                                        │
└────────────────────────────────────────┘
```

### Formato de Fechas

Las fechas se muestran en formato localizado:
- **Español**: "15 de enero de 2026"
- **English**: "January 15, 2026"

## 🔧 Detalles Técnicos

### Tipo de Datos

Las columnas usan el tipo `date` de PostgreSQL, que:
- Solo almacena la fecha (sin hora)
- Se almacena en formato `YYYY-MM-DD`
- Es compatible con inputs HTML de tipo `date`

### Valores Permitidos

- **NULL**: Ambas columnas son opcionales
- **Cualquier fecha válida**: No hay restricciones de rango

### Recomendaciones

1. **Fecha de Inicio**: Útil para proyectos que aún no han comenzado
2. **Fecha de Entrega**: Esencial para mostrar la cuenta regresiva
3. **Actualización**: Mantén las fechas actualizadas si hay cambios en el cronograma

## ⚠️ Notas Importantes

- Las fechas son opcionales, pero la cuenta regresiva solo se muestra si existe `end_date`
- Las columnas se agregan sin valores por defecto para proyectos existentes
- Puedes actualizar proyectos existentes para agregar las fechas
- La cuenta regresiva usa la zona horaria del navegador del cliente

## 🐛 Solución de Problemas

### Error: "Could not find the 'end_date' column"

**Causa**: Las columnas no se han agregado a la base de datos.

**Solución**:
1. Ejecuta el script SQL en `/scripts/add-project-dates.sql`
2. Verifica que las columnas se agregaron correctamente
3. Refresca la página del formulario

### La cuenta regresiva no se muestra

**Verifica**:
1. El proyecto tiene una `end_date` configurada
2. La fecha es válida y está en el futuro
3. El componente `ProjectCountdown` está importado correctamente

## ✅ Checklist de Implementación

- ✅ Script SQL ejecutado en Supabase
- ✅ Columnas `start_date` y `end_date` agregadas
- ✅ Formulario de proyectos muestra campos de fecha
- ✅ Vista de detalle muestra las fechas
- ✅ Cuenta regresiva funciona correctamente
- ✅ Soporte multiidioma (ES/EN) implementado
