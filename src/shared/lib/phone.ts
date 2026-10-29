/**
 * South African phone numbers.
 *
 * People type numbers as "082 123 4567", "+27 82 123 4567" or "27821234567".
 * We keep what they typed for display and normalise only when matching
 * borrowers or building a wa.me link (which needs digits in international form).
 */

const SA_COUNTRY_CODE = "27"

/** Returns digits in international form (e.g. "27821234567"), or null if it isn't a usable number. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  let digits = trimmed.replace(/[^\d]/g, "")
  if (trimmed.startsWith("00")) digits = digits.slice(2)

  // Local format: 0XX XXX XXXX
  if (digits.length === 10 && digits.startsWith("0")) {
    return SA_COUNTRY_CODE + digits.slice(1)
  }
  // Already international: 27XXXXXXXXX
  if (digits.length === 11 && digits.startsWith(SA_COUNTRY_CODE)) {
    return digits
  }
  // Other countries: accept a plausible international number when it was typed with "+".
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return digits
  }
  return null
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null
}

/** "082 123 4567" for SA numbers; otherwise what was typed. */
export function formatPhone(raw: string): string {
  const normalized = normalizePhone(raw)
  if (!normalized || !normalized.startsWith(SA_COUNTRY_CODE) || normalized.length !== 11) {
    return raw.trim()
  }
  const local = "0" + normalized.slice(2)
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}
