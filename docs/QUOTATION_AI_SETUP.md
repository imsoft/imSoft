# Configuración de IA para Cotizaciones

Este documento explica cómo configurar la integración con ChatGPT para obtener recomendaciones automáticas de precio y tiempo de desarrollo en las cotizaciones.

## 📋 Características Implementadas

### ✅ Para Administradores
- **Input de Precio Final**: Campo para que el administrador establezca el precio final a cobrar al cliente
- **Tiempo Estimado de Desarrollo**: Campo para establecer el tiempo estimado en días hábiles
- **Recomendación de IA**: Botón para obtener recomendaciones de ChatGPT basadas en:
  - Respuestas del cuestionario
  - Información del servicio
  - Complejidad del proyecto
  - Análisis de mercado mexicano

## 🚀 Instalación

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `/scripts/add-quotation-admin-fields.sql`
5. Ejecuta el script (botón "Run" o `Ctrl/Cmd + Enter`)

El script agregará las siguientes columnas a la tabla `quotations`:
- `final_price` (DECIMAL) - Precio final decidido por el administrador
- `estimated_development_time` (INTEGER) - Tiempo estimado en días hábiles
- `ai_recommendation` (JSONB) - Recomendaciones de IA almacenadas

### Paso 2: Configurar API Key de OpenAI

1. Obtén tu API Key de OpenAI:
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API key o usa una existente

2. Agrega la variable de entorno:
   - En tu archivo `.env.local` o en las variables de entorno de tu plataforma de hosting
   - Agrega: `OPENAI_API_KEY=tu_api_key_aqui`

3. **Importante**: Asegúrate de que la variable esté disponible en el entorno de producción si usas Vercel, Netlify, etc.

### Paso 3: Verificar la Instalación

Para verificar que las columnas se agregaron correctamente, ejecuta esta query en Supabase:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'quotations'
AND column_name IN ('final_price', 'estimated_development_time', 'ai_recommendation');
```

Deberías ver las tres columnas listadas.

## 📖 Uso

### Dashboard de Admin

#### Ver Detalles de Cotización

1. Ve a **Cotizaciones** → Selecciona una cotización
2. En la sección **"Configuración de Administrador"** verás:
   - Botón para obtener recomendación de IA
   - Campo de Precio Final
   - Campo de Tiempo Estimado de Desarrollo

#### Obtener Recomendación de IA

1. Haz clic en **"Obtener Recomendación de IA"**
2. El sistema analizará:
   - Las respuestas del cuestionario
   - La información del servicio
   - La complejidad del proyecto
3. ChatGPT proporcionará:
   - Precio recomendado en MXN
   - Tiempo estimado en días hábiles
   - Razonamiento breve
   - Análisis detallado del proyecto

4. Los campos se auto-completarán con las recomendaciones (si estaban vacíos)

#### Establecer Precio Final y Tiempo

1. Ingresa el **Precio Final** que deseas cobrar al cliente (en MXN)
2. Ingresa el **Tiempo Estimado de Desarrollo** (en días hábiles)
3. Haz clic en **"Guardar"** para actualizar la cotización

**Nota**: Puedes usar las recomendaciones de IA como guía, pero el precio y tiempo finales son decisión del administrador.

## 🔧 Estructura de Datos

### Campo `ai_recommendation` (JSONB)

Almacena un objeto JSON con la siguiente estructura:

```json
{
  "recommended_price": 50000.00,
  "recommended_time_days": 30,
  "reasoning": "Basado en la complejidad del proyecto...",
  "analysis": "Análisis detallado del proyecto..."
}
```

## ⚠️ Consideraciones

1. **Costos de OpenAI**: Cada consulta a ChatGPT tiene un costo. El modelo usado es `gpt-4o-mini` que es más económico.

2. **Tiempo de Respuesta**: La generación de recomendaciones puede tomar 5-15 segundos dependiendo de la complejidad.

3. **Límites de API**: Asegúrate de tener créditos suficientes en tu cuenta de OpenAI.

4. **Privacidad**: Las cotizaciones se envían a OpenAI para análisis. Asegúrate de cumplir con las políticas de privacidad de tu empresa.

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY is not defined"
- Verifica que la variable de entorno esté configurada correctamente
- Reinicia el servidor de desarrollo después de agregar la variable
- En producción, verifica que la variable esté configurada en tu plataforma de hosting

### Error: "Error generating AI recommendation"
- Verifica que tu API key de OpenAI sea válida
- Revisa que tengas créditos disponibles en tu cuenta de OpenAI
- Verifica los logs del servidor para más detalles

### La recomendación no se muestra
- Verifica que la respuesta de OpenAI sea válida
- Revisa la consola del navegador para errores
- Asegúrate de que el campo `ai_recommendation` se guardó correctamente en la base de datos

## 📝 Notas Adicionales

- El precio final y tiempo estimado son independientes del precio calculado automáticamente
- Las recomendaciones de IA son sugerencias, no obligatorias
- Puedes actualizar el precio final y tiempo estimado en cualquier momento
- Las recomendaciones se guardan en la base de datos para referencia futura
