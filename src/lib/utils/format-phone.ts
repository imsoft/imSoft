/**
 * Formatea un número de teléfono mexicano de 10 dígitos
 * Ejemplo: "3325365558" -> "33 2536 5558"
 *
 * @param phone - Número de teléfono sin formatear
 * @returns Número de teléfono formateado
 */
export function formatPhoneNumber(phone: string): string {
  // Eliminar todos los espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Si el número tiene 10 dígitos (formato mexicano estándar)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }

  // Si el número tiene +52 al inicio (código de país de México)
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    const number = cleaned.slice(2);
    return `+52 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`;
  }

  // Si el número tiene un formato diferente, devolverlo tal cual
  return phone;
}
