# Configuración de Título y Descripción en Cotizaciones

Este documento explica cómo agregar las columnas de título y descripción detallada a la tabla `quotations` en Supabase.

## 📋 Resumen

Los campos de título y descripción permiten:
- Agregar un título descriptivo a cada cotización
- Incluir información adicional más allá de las respuestas del cuestionario
- Identificar rápidamente las cotizaciones en la tabla de administración
- Proporcionar contexto adicional al cliente sobre la cotización

## 🚀 Instalación

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `/scripts/add-quotation-title-description.sql`
5. Ejecuta el script (botón "Run" o `Ctrl/Cmd + Enter`)

El script agregará las siguientes columnas a la tabla `quotations`:
- `title` (tipo: `character varying(255)`) - Título de la cotización (requerido)
- `description` (tipo: `text`) - Descripción detallada (opcional)

### Paso 2: Verificar la Instalación

Para verificar que las columnas se agregaron correctamente, ejecuta esta query:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'quotations'
AND column_name IN ('title', 'description');
```

Deberías ver:
```
| column_name | data_type         | character_maximum_length |
|-------------|-------------------|--------------------------|
| title       | character varying | 255                      |
| description | text              | null                     |
```

## 📖 Uso

### Dashboard de Admin

#### Crear Nueva Cotización

1. Ve a **Cotizaciones** → **Nueva Cotización**
2. Completa la información del cliente:
   - Nombre del cliente
   - Email
   - Empresa (opcional)
3. Selecciona un servicio
4. **Nuevo**: Completa los campos de cotización:
   - **Título de la Cotización** (requerido): Un título descriptivo
     - Ejemplo: "Desarrollo Web para Acme Corp"
     - Ejemplo: "App Móvil E-commerce - Tienda Fashion"
   - **Descripción Adicional** (opcional): Información detallada
     - Funcionalidades especiales
     - Requisitos específicos del cliente
     - Notas importantes sobre el proyecto
5. Responde el cuestionario del servicio
6. Revisa el resumen del precio
7. Guarda la cotización

#### Tabla de Cotizaciones

La tabla ahora muestra:
- **Título**: Primera columna con el título de la cotización
  - Texto truncado si es muy largo (max 200px)
  - Muestra "Sin título" / "Untitled" si no hay título
- Cliente
- Servicio
- Total
- Estado
- Fecha
- Acciones

### Dashboard del Cliente

Cuando un cliente ve su cotización:

1. **Card Principal**: Si existe título o descripción
   - **Título**: Se muestra como CardTitle
   - **Badge de Estado**: Muestra el estado actual
   - **Descripción**: Se muestra en el CardContent con formato de párrafos

2. **Información General**: Datos del cliente y servicio
   - Solo muestra el badge de estado si NO hay título/descripción en el card principal

3. **Respuestas del Cuestionario**: Respuestas proporcionadas

4. **Resumen del Precio**: Subtotal, IVA y Total

## 🎨 Características

### Campos del Formulario

**Título de la Cotización**
```
┌────────────────────────────────────────────────┐
│ Título de la Cotización *                      │
├────────────────────────────────────────────────┤
│ ej., Desarrollo Web para Acme Corp            │
└────────────────────────────────────────────────┘
Un título descriptivo para esta cotización
```

**Descripción Adicional**
```
┌────────────────────────────────────────────────┐
│ Descripción Adicional (Opcional)               │
├────────────────────────────────────────────────┤
│                                                │
│ Agrega información adicional más allá del      │
│ cuestionario...                                │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
Descripción detallada con información adicional
más allá de las respuestas del cuestionario
```

### Visualización Cliente

**Con Título y Descripción:**
```
┌─────────────────────────────────────────────────┐
│ Desarrollo Web para Acme Corp    [Pendiente]   │
├─────────────────────────────────────────────────┤
│ Proyecto de sitio web corporativo con sistema  │
│ de gestión de contenidos, integración de       │
│ pagos y panel de administración personalizado. │
│                                                 │
│ Incluye diseño responsive y optimización SEO.  │
└─────────────────────────────────────────────────┘
```

**Sin Título/Descripción (legacy):**
```
┌─────────────────────────────────────────────────┐
│ Información General          [Pendiente]        │
├─────────────────────────────────────────────────┤
│ Cliente: Juan Pérez                             │
│ Email: juan@example.com                         │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

## 🔧 Detalles Técnicos

### Tipo de Datos

**title**
- Tipo: `character varying(255)`
- Máximo 255 caracteres
- Requerido en el formulario
- Valor por defecto para registros existentes: "Cotización para [Nombre Cliente]"

**description**
- Tipo: `text`
- Sin límite de caracteres
- Opcional
- Permite formato de párrafos (whitespace-pre-wrap)

### Validación del Formulario

```typescript
const quotationSchema = z.object({
  service_id: z.string().min(1, 'El servicio es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  client_name: z.string().min(1, 'El nombre del cliente es requerido'),
  client_email: z.string().email('Email inválido'),
  client_company: z.string().optional(),
  answers: z.record(z.any()),
})
```

### Interfaz TypeScript

```typescript
export interface Quotation {
  id: string
  user_id: string
  service_id?: string
  title?: string              // Nuevo
  description?: string        // Nuevo
  client_name?: string
  client_email?: string
  client_company?: string
  answers: Record<string, any>
  subtotal: number
  iva: number
  total: number
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  notes?: string
  valid_until?: string
  created_at?: string
  updated_at?: string
}
```

## 💡 Mejores Prácticas

### Títulos Efectivos

**Buenos ejemplos:**
- ✅ "Desarrollo Web para Acme Corp"
- ✅ "App Móvil E-commerce - Fashion Store"
- ✅ "Rediseño de Sitio Web Corporativo"
- ✅ "Sistema de Gestión de Inventario"

**Evitar:**
- ❌ "Cotización" (muy genérico)
- ❌ "Web" (muy vago)
- ❌ "Proyecto 123" (sin contexto)

### Descripciones Útiles

Incluye información como:
- Funcionalidades principales no cubiertas en el cuestionario
- Requisitos técnicos específicos
- Integraciones necesarias
- Consideraciones especiales del cliente
- Fases del proyecto
- Tecnologías específicas acordadas

**Ejemplo:**
```
Proyecto de desarrollo web con las siguientes características:

1. Diseño personalizado responsive
2. Sistema de gestión de contenidos (CMS)
3. Integración con pasarela de pagos Stripe
4. Panel de administración con analytics
5. Optimización SEO y velocidad de carga
6. Soporte para 3 idiomas (ES, EN, FR)

Incluye 3 meses de soporte post-lanzamiento.
```

## ⚠️ Notas Importantes

- El título es **requerido** para nuevas cotizaciones
- La descripción es **opcional** pero recomendada para proyectos complejos
- Las cotizaciones existentes se actualizan automáticamente con un título por defecto
- El título se muestra truncado en la tabla (max 200px) pero completo en la vista detallada
- La descripción soporta saltos de línea y formato de párrafos

## 🐛 Solución de Problemas

### Error: "El título es requerido"

**Causa**: Intentas guardar una cotización sin título.

**Solución**: Completa el campo "Título de la Cotización" antes de guardar.

### Las cotizaciones existentes muestran "Cotización para [Cliente]"

**Causa**: El script SQL actualiza automáticamente las cotizaciones existentes.

**Solución**: Esto es normal. Puedes editar manualmente las cotizaciones para personalizar el título.

### La descripción no muestra saltos de línea

**Causa**: Error en el CSS del componente.

**Solución**: Verifica que el elemento tenga la clase `whitespace-pre-wrap`:
```tsx
<p className="text-base whitespace-pre-wrap">{quotation.description}</p>
```

## ✅ Checklist de Implementación

- ✅ Script SQL ejecutado en Supabase
- ✅ Columnas `title` y `description` agregadas
- ✅ Interfaz TypeScript actualizada
- ✅ Formulario de cotización actualizado con nuevos campos
- ✅ Validación del formulario configurada
- ✅ Tabla de cotizaciones muestra columna de título
- ✅ Vista de detalle muestra título y descripción
- ✅ Soporte multiidioma (ES/EN) implementado
- ✅ Cotizaciones existentes actualizadas con títulos por defecto
