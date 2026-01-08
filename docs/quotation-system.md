# Sistema de Cotizaciones

Sistema completo de cotizaciones con cuestionarios configurables, cálculo en tiempo real con IVA, y gestión de preguntas por servicio.

## 📋 Características Implementadas

### ✅ Para Administradores
- **CRUD de Preguntas del Cotizador**
  - Crear preguntas personalizadas por servicio
  - 4 tipos de preguntas: Opción múltiple, Sí/No, Número, Rango
  - Configurar precios base y multiplicadores
  - Ordenar preguntas por prioridad
  - Marcar preguntas como requeridas u opcionales

- **Gestión de Cotizaciones**
  - Ver todas las cotizaciones generadas
  - Filtrar por estado (Pendiente, Aprobada, Rechazada, Convertida)
  - Ver detalles completos de cada cotización
  - Exportar cotizaciones (próximamente)

- **Creación de Cotizaciones**
  - Generar cotizaciones para clientes
  - Cálculo automático en tiempo real
  - Incluye IVA (16%)
  - Validez de 30 días

### ✅ Para Clientes
- **Auto-Cotizador Interactivo**
  - Seleccionar servicio
  - Responder cuestionario personalizado
  - Ver precio actualizado en tiempo real
  - Guardar cotizaciones para referencia

- **Mis Cotizaciones**
  - Ver historial de cotizaciones
  - Consultar estado de cada cotización
  - Descargar/imprimir cotizaciones (próximamente)

## 🗄️ Estructura de Base de Datos

### Tabla: `quotation_questions`
```sql
- id (UUID)
- service_id (FK a services)
- question_es (TEXT)
- question_en (TEXT)
- question_type (VARCHAR) - 'multiple_choice', 'number', 'yes_no', 'range'
- options (JSONB) - Opciones con precios
- base_price (DECIMAL)
- price_multiplier (DECIMAL)
- is_required (BOOLEAN)
- order_index (INTEGER)
```

### Tabla: `quotations`
```sql
- id (UUID)
- user_id (FK a auth.users)
- service_id (FK a services)
- client_name (VARCHAR)
- client_email (VARCHAR)
- client_company (VARCHAR)
- answers (JSONB)
- subtotal (DECIMAL)
- iva (DECIMAL)
- total (DECIMAL)
- status (VARCHAR) - 'pending', 'approved', 'rejected', 'converted'
- notes (TEXT)
- valid_until (TIMESTAMP)
```

## 🚀 Instalación

### 1. Ejecutar Script SQL

Ejecuta el siguiente script en Supabase SQL Editor:

```bash
scripts/create-quotation-system.sql
```

Este script:
- ✅ Crea las tablas necesarias
- ✅ Configura índices para rendimiento
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea políticas de seguridad
- ✅ Agrega triggers para updated_at

### 2. Verificar Permisos RLS

Las políticas RLS ya están configuradas:

**Preguntas (quotation_questions)**:
- Todos pueden leer preguntas ✅
- Solo admins pueden crear/editar/eliminar ✅

**Cotizaciones (quotations)**:
- Los usuarios solo ven sus propias cotizaciones ✅
- Admins pueden ver todas las cotizaciones ✅
- Los usuarios pueden crear sus propias cotizaciones ✅

### 3. Acceder al Sistema

**Admin**: `/{lang}/dashboard/admin/quotations`
**Cliente**: `/{lang}/dashboard/client/quotations`

## 📝 Tipos de Preguntas

### 1. Opción Múltiple (multiple_choice)
- El usuario selecciona una opción
- Cada opción tiene un precio asociado
- Ejemplo: "¿Qué tipo de diseño necesitas?"
  - Diseño básico (+$5,000)
  - Diseño premium (+$10,000)
  - Diseño personalizado (+$20,000)

### 2. Sí/No (yes_no)
- Pregunta simple de sí o no
- Si responde "Sí", se agrega el precio base
- Ejemplo: "¿Necesitas hosting?" (+$2,000/año)

### 3. Número (number)
- El usuario ingresa una cantidad
- Se calcula: base_price + (cantidad × price_multiplier)
- Ejemplo: "¿Cuántas páginas necesitas?"
  - Base: $10,000
  - Por página adicional: $1,500

### 4. Rango (range)
- Slider de 1 a 20
- Mismo cálculo que número pero con interfaz visual
- Ejemplo: "¿Cuántos usuarios tendrás?"

## 💰 Cálculo de Precios

### Fórmula
```
Subtotal = Σ (precios de todas las respuestas)
IVA = Subtotal × 0.16
Total = Subtotal + IVA
```

### Ejemplo Práctico

**Servicio**: Desarrollo Web

**Preguntas**:
1. Tipo de sitio (Opción múltiple)
   - Respuesta: "E-commerce" → $20,000

2. ¿Necesitas diseño personalizado? (Sí/No)
   - Respuesta: "Sí" → $5,000

3. Número de páginas (Número)
   - Respuesta: 10 páginas
   - Cálculo: $8,000 (base) + (10 × $1,000) = $18,000

**Cálculo**:
```
Subtotal = $20,000 + $5,000 + $18,000 = $43,000
IVA (16%) = $43,000 × 0.16 = $6,880
Total = $43,000 + $6,880 = $49,880 MXN
```

## 🎯 Flujo de Uso

### Para Clientes

1. Ir a "Mis Cotizaciones"
2. Clic en "Nueva Cotización"
3. Llenar información personal
4. Seleccionar servicio
5. Responder cuestionario
6. Ver precio calculado en tiempo real
7. Guardar cotización

### Para Administradores

#### Configurar Preguntas

1. Ir a "Cotizaciones" → "Gestionar Preguntas"
2. Seleccionar servicio
3. Crear nuevas preguntas
4. Configurar tipo, opciones y precios
5. Ordenar preguntas
6. Guardar

#### Gestionar Cotizaciones

1. Ver todas las cotizaciones
2. Cambiar estado (Pendiente → Aprobada/Rechazada)
3. Agregar notas
4. Convertir a proyecto

## 📂 Archivos Creados

### Admin
```
src/app/[lang]/dashboard/admin/quotations/
├── page.tsx                    # Lista de cotizaciones
├── quotations-table.tsx        # Tabla de cotizaciones
├── quotation-form.tsx          # Formulario del cotizador
├── new/
│   └── page.tsx               # Nueva cotización
└── questions/
    ├── page.tsx               # Gestión de preguntas
    └── questions-manager.tsx  # Manager de preguntas (pendiente)
```

### Cliente
```
src/app/[lang]/dashboard/client/quotations/
├── page.tsx                    # Mis cotizaciones
├── quotations-table.tsx        # Tabla de cotizaciones
└── new/
    └── page.tsx               # Nueva cotización
```

### Base de Datos
```
scripts/
└── create-quotation-system.sql
```

### Tipos
```
src/types/database.ts
├── QuotationQuestion
├── QuotationOption
└── Quotation
```

## 🎨 Componentes UI Utilizados

- ✅ Card - Para secciones del formulario
- ✅ Form - React Hook Form + Zod
- ✅ Select - Selector de servicio
- ✅ RadioGroup - Preguntas de opción múltiple y sí/no
- ✅ Input - Preguntas numéricas y datos del cliente
- ✅ Slider - Preguntas de rango
- ✅ Table - Lista de cotizaciones
- ✅ Badge - Estados de cotizaciones
- ✅ Button - Acciones

## 🔄 Próximas Mejoras

### Corto Plazo
- [ ] Implementar questions-manager.tsx (CRUD completo de preguntas)
- [ ] Página de detalles de cotización
- [ ] Exportar cotización a PDF
- [ ] Enviar cotización por email
- [ ] Duplicar cotización

### Mediano Plazo
- [ ] Dashboard de estadísticas de cotizaciones
- [ ] Plantillas de cotizaciones
- [ ] Descuentos y promociones
- [ ] Comparar cotizaciones
- [ ] Firmar cotizaciones digitalmente

### Largo Plazo
- [ ] Convertir cotización a proyecto automáticamente
- [ ] Integración con CRM
- [ ] Recordatorios de seguimiento
- [ ] Analytics de tasa de conversión
- [ ] A/B testing de preguntas

## 🐛 Troubleshooting

### Las preguntas no cargan

**Problema**: Al seleccionar un servicio, no aparecen preguntas.

**Solución**:
1. Verifica que existan preguntas para ese servicio en la BD
2. Revisa la consola para errores
3. Confirma que las políticas RLS permitan leer preguntas
4. Ejecuta: `SELECT * FROM quotation_questions WHERE service_id = 'tu-service-id'`

### El precio no se calcula

**Problema**: El total siempre aparece en $0.00

**Solución**:
1. Verifica que las preguntas tengan precios configurados
2. Asegúrate de que las opciones tengan el campo `price`
3. Revisa que los precios sean números, no strings
4. Checa la consola para errores en calculatePrice()

### Error al guardar cotización

**Problema**: "Error creating quotation" al intentar guardar.

**Solución**:
1. Verifica que todas las preguntas requeridas estén respondidas
2. Confirma que el user_id sea válido
3. Revisa las políticas RLS de la tabla quotations
4. Checa que el service_id exista
5. Mira los logs de Supabase para el error específico

## 📊 Ejemplo de Datos

### Pregunta de Opción Múltiple
```json
{
  "id": "uuid",
  "service_id": "uuid-del-servicio",
  "question_es": "¿Qué tipo de diseño necesitas?",
  "question_en": "What type of design do you need?",
  "question_type": "multiple_choice",
  "options": [
    { "label_es": "Diseño Básico", "label_en": "Basic Design", "price": 5000 },
    { "label_es": "Diseño Premium", "label_en": "Premium Design", "price": 10000 },
    { "label_es": "Diseño Personalizado", "label_en": "Custom Design", "price": 20000 }
  ],
  "base_price": 0,
  "price_multiplier": 1,
  "is_required": true,
  "order_index": 1
}
```

### Cotización Guardada
```json
{
  "id": "uuid",
  "user_id": "uuid-del-usuario",
  "service_id": "uuid-del-servicio",
  "client_name": "Juan Pérez",
  "client_email": "juan@ejemplo.com",
  "client_company": "Empresa XYZ",
  "answers": {
    "question-uuid-1": "Diseño Premium",
    "question-uuid-2": "yes",
    "question-uuid-3": 10
  },
  "subtotal": 43000,
  "iva": 6880,
  "total": 49880,
  "status": "pending",
  "valid_until": "2026-02-05T00:00:00Z"
}
```

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Los usuarios solo ven sus cotizaciones
- ✅ Validación de entrada con Zod
- ✅ Timestamps automáticos
- ✅ Foreign keys con ON DELETE CASCADE/SET NULL

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
1. Revisa esta documentación
2. Consulta los logs de Supabase
3. Verifica las políticas RLS
4. Checa la consola del navegador para errores

---

**Versión**: 1.0.0
**Última actualización**: Enero 2026
**Autor**: imSoft Development Team
