# Configuración de AI para Emails de Deals y Contador de Emails

Este documento explica cómo configurar la integración con OpenAI para generar emails personalizados y el sistema de rastreo de emails por etapa.

## 📋 Características Implementadas

### ✅ Generación de Emails con AI
- **Emails Personalizados**: Generación automática de emails usando OpenAI GPT-4o-mini
- **Contexto Completo**: La AI considera información del deal, contacto, servicio, cotización e historial
- **Emails Progresivos**: Cada email muestra avance y no repite información de emails anteriores
- **Personalización**: Incluye detalles específicos del negocio y contacto

### ✅ Contador de Emails por Etapa
- **Rastreo por Etapa**: Cuenta cuántos emails se han enviado en la etapa actual del deal
- **Visualización**: Muestra el contador en badges y botones de envío
- **Historial Completo**: Guarda todos los emails enviados con su etapa, asunto y cuerpo

## 🚀 Instalación

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `/scripts/create-deal-emails-table.sql`
5. Ejecuta el script (botón "Run" o `Ctrl/Cmd + Enter`)

El script creará la tabla `deal_emails` con las siguientes columnas:
- `id` (UUID): Identificador único
- `deal_id` (UUID): Referencia al deal
- `stage` (VARCHAR): Etapa en la que se envió el email
- `subject` (TEXT): Asunto del email
- `body` (TEXT): Cuerpo del email (HTML)
- `sent_at` (TIMESTAMPTZ): Fecha y hora de envío
- `sent_by` (UUID): Usuario que envió el email
- `created_at` (TIMESTAMPTZ): Fecha de creación del registro

### Paso 2: Configurar API Key de OpenAI

1. Obtén tu API Key de OpenAI:
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API key o usa una existente

2. Agrega la variable de entorno:
   - En tu archivo `.env.local` o en las variables de entorno de tu plataforma de hosting
   - Agrega: `OPENAI_API_KEY=tu_api_key_aqui`

3. **Importante**: Asegúrate de que la variable esté disponible en el entorno de producción si usas Vercel, Netlify, etc.

### Paso 3: Verificar la Instalación

Para verificar que la tabla se creó correctamente, ejecuta esta query en Supabase:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'deal_emails';
```

Deberías ver todas las columnas listadas.

## 📖 Uso

### Generar Email con AI

1. Navega a un deal en el CRM
2. Haz clic en "Enviar Email" (botón o badge)
3. La página de envío cargará automáticamente un email generado con AI
4. Puedes editar el asunto y cuerpo si es necesario
5. Haz clic en "Generar con IA" para regenerar el email
6. Revisa la vista previa y envía el email

### Ver Contador de Emails

- **En el Kanban Board**: El badge muestra "X Correo(s)" donde X es el número de emails enviados en la etapa actual
- **En la Página de Detalles**: El botón "Enviar Email" muestra un badge con el contador

### Historial de Emails

Todos los emails enviados se guardan automáticamente en la tabla `deal_emails` con:
- La etapa en la que se envió
- El asunto y cuerpo completo
- La fecha y hora de envío
- El usuario que lo envió

La AI usa este historial para generar emails progresivos que no repiten información.

## 🔧 Funcionamiento de la AI

La AI genera emails considerando:

1. **Información del Deal**:
   - Título del negocio
   - Valor del negocio
   - Etapa actual
   - Probabilidad de cierre

2. **Información del Contacto**:
   - Nombre completo
   - Empresa
   - Email y teléfono
   - Notas sobre la empresa

3. **Servicio de Interés**:
   - Nombre y descripción del servicio

4. **Cotización Asociada** (si existe):
   - Título y descripción
   - Precio final o total

5. **Historial de Emails**:
   - Número de emails enviados en la etapa actual
   - Asuntos de emails anteriores
   - Fechas de envío
   - Genera emails progresivos que muestran avance

## 📝 Notas Técnicas

- La AI usa el modelo `gpt-4o-mini` de OpenAI
- Los emails se generan en español
- El formato de respuesta es JSON con `subject` y `body`
- El `body` generado se envuelve en el template HTML de imSoft
- Si la generación con AI falla, se carga el template por defecto

## 🐛 Solución de Problemas

### Error: "OpenAI API key is not configured"
- Verifica que `OPENAI_API_KEY` esté configurada en las variables de entorno
- Reinicia el servidor después de agregar la variable

### Error: "Deal not found" al generar email
- Verifica que el deal existe y tiene un contacto asociado
- Asegúrate de que el usuario tenga permisos de admin

### El contador no se actualiza
- Verifica que la tabla `deal_emails` se creó correctamente
- Revisa que el endpoint de envío esté guardando en la tabla
- Refresca la página después de enviar un email
