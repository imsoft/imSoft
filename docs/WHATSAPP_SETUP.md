# Configuración de Envío de Cotizaciones por WhatsApp

Este documento explica cómo configurar el envío de cotizaciones por WhatsApp usando Twilio.

## 📋 Características Implementadas

### ✅ Para Administradores
- **Envío por WhatsApp**: Botón para enviar cotizaciones directamente por WhatsApp
- **Formato optimizado**: Mensajes formateados con emojis y información esencial
- **Validación automática**: Verifica que el número de teléfono esté disponible
- **Manejo de errores**: Mensajes claros si el envío falla

## 🚀 Instalación

### Paso 1: Crear Cuenta en Twilio

1. Ve a https://www.twilio.com/
2. Crea una cuenta gratuita (incluye créditos de prueba)
3. Verifica tu número de teléfono personal

### Paso 2: Configurar WhatsApp en Twilio

1. **Obtener Número de WhatsApp de Prueba** (para desarrollo):
   - Ve a la consola de Twilio: https://console.twilio.com/
   - Navega a **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Twilio te proporcionará un número de prueba (formato: `whatsapp:+14155238886`)
   - O usa tu número de WhatsApp Business: `whatsapp:+523325365558`
   - Este número solo funciona con números verificados en tu cuenta

2. **Para Producción** (requiere número de WhatsApp Business):
   - Necesitas un número de WhatsApp Business verificado
   - Puedes usar tu número personal temporalmente para pruebas
   - Para producción, necesitarás solicitar un número dedicado de Twilio

### Paso 3: Obtener Credenciales

1. En la consola de Twilio, ve a **Settings** → **General**
2. Encuentra:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (haz clic en "view" para verlo)

### Paso 4: Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+523325365558
```

**Nota**: 
- Para desarrollo, puedes usar el número de prueba de Twilio: `+14155238886`
- Para producción, usa tu número de WhatsApp Business: `+523325365558`
- El formato debe ser: `+523325365558` (sin el prefijo `whatsapp:`)
- El código automáticamente agrega el prefijo `whatsapp:` cuando envía mensajes

### Paso 5: Verificar la Instalación

1. Asegúrate de que el SDK de Twilio esté instalado:
   ```bash
   pnpm add twilio
   ```

2. Verifica que las variables de entorno estén configuradas correctamente

## 📖 Uso

### Dashboard de Admin

#### Enviar Cotización por WhatsApp

1. Ve a **Cotizaciones** → Selecciona una cotización
2. Verifica que la cotización tenga un número de teléfono del cliente (`client_phone`)
3. Haz clic en **"Enviar por WhatsApp"**
4. El sistema:
   - Validará el número de teléfono
   - Formateará el número a formato internacional
   - Generará el mensaje con la información de la cotización
   - Enviará el mensaje por WhatsApp

### Formato del Mensaje

El mensaje incluye:
- 🏢 Encabezado con nombre de la empresa
- 👤 Nombre del cliente
- 📋 Servicio cotizado
- 💰 Precio total (usa `final_price` si existe, sino `total`)
- ⏱️ Tiempo estimado (si está configurado)
- 📋 Resumen de respuestas clave (máximo 3)
- 📅 Fecha de validez (si existe)

### Ejemplo de Mensaje

```
🏢 *imSoft - Cotización*

Hola *Juan Pérez*,

Te enviamos la cotización solicitada:

📋 *Servicio:* Desarrollo Web - Aplicación E-commerce
💰 *Precio Total:* $50,000.00 MXN
⏱️ Tiempo estimado: 30 días

📋 Resumen:
• Tipo de aplicación: E-commerce
• Número de productos: 100-500
• Integración de pagos: Sí

📅 Válida hasta: 15/02/2025

Para más detalles, contáctanos.

Gracias por confiar en imSoft.
```

## 🔧 Configuración Avanzada

### Formato de Números de Teléfono

El sistema automáticamente:
- Detecta si el número tiene código de país
- Si no tiene código, asume México (52)
- Formatea a formato internacional: `whatsapp:+521234567890`

**Formatos soportados**:
- `1234567890` → `whatsapp:+521234567890`
- `+521234567890` → `whatsapp:+521234567890`
- `52 12 34 56 78 90` → `whatsapp:+521234567890`

### Manejo de Errores

El sistema maneja los siguientes errores:

1. **Número no válido para WhatsApp**:
   - Error: "The phone number is not registered on WhatsApp"
   - Solución: Verifica que el número tenga WhatsApp activo

2. **Credenciales no configuradas**:
   - Error: "WhatsApp service is not configured"
   - Solución: Verifica las variables de entorno

3. **Formato de número inválido**:
   - Error: "Invalid phone number format"
   - Solución: Verifica que el número tenga formato correcto

4. **Número de teléfono faltante**:
   - Error: "Client phone number is required"
   - Solución: Agrega `client_phone` a la cotización

## 💰 Costos

### Twilio WhatsApp Pricing

- **Setup**: Gratis
- **Número de prueba**: Gratis (limitado a números verificados)
- **Mensajes salientes**: ~$0.005-0.01 USD por mensaje
- **Número dedicado**: ~$1-2 USD/mes (para producción)

### Límites de Prueba

- Número de prueba solo funciona con números verificados en tu cuenta
- Para producción, necesitas un número de WhatsApp Business verificado

## ⚠️ Consideraciones Importantes

1. **Números de Prueba**:
   - Solo funcionan con números que hayas verificado en Twilio
   - Para probar, agrega tu número personal en la consola de Twilio

2. **Producción**:
   - Necesitas un número de WhatsApp Business verificado
   - El proceso de verificación puede tardar algunos días
   - Twilio te guiará en el proceso

3. **Políticas de WhatsApp**:
   - No puedes enviar mensajes no solicitados (spam)
   - Los clientes deben haber iniciado contacto o dado consentimiento
   - Respeta las políticas de WhatsApp Business

4. **Rate Limits**:
   - Twilio tiene límites de velocidad
   - Para alto volumen, considera implementar una cola de mensajes

## 🐛 Solución de Problemas

### Error: "Twilio credentials are not configured"
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor después de agregar las variables
- En producción, verifica que estén en tu plataforma de hosting

### Error: "The phone number is not registered on WhatsApp"
- El número no tiene WhatsApp activo
- Verifica que el número sea correcto
- Asegúrate de que el número tenga WhatsApp instalado y activo

### Error: "Invalid phone number format"
- Verifica el formato del número en la base de datos
- El sistema intenta formatear automáticamente, pero algunos formatos pueden fallar

### El mensaje no se envía
- Verifica que tengas créditos en tu cuenta de Twilio
- Revisa los logs del servidor para más detalles
- Verifica que el número de WhatsApp de Twilio esté correcto

## 📝 Notas Adicionales

- Los mensajes se envían en español por defecto
- El precio mostrado usa `final_price` si existe, sino usa `total`
- El tiempo estimado solo se muestra si está configurado
- El resumen de respuestas muestra máximo 3 respuestas clave
- Los mensajes son de texto plano (no soportan HTML)

## 🔗 Recursos

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Console de Twilio](https://console.twilio.com/)
- [Pricing de Twilio](https://www.twilio.com/whatsapp/pricing)
