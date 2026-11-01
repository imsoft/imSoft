/**
 * Formats a 10-digit Mexican phone number
 * Example: "3325365558" -> "33 2536 5558"
 *
 * @param phone - Unformatted phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all spaces, dashes and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If the number has 10 digits (standard Mexican format)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }

  // If the number starts with +52 (Mexico's country code)
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    const number = cleaned.slice(2);
    return `+52 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`;
  }

  // If the number has a different format, return it as is
  return phone;
}
