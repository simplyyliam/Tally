import { addDays, isIsoDate, type IsoDate } from "@/shared/lib/dates"

/**
 * Reading single spreadsheet cells. Every cell arrives as text (the file
 * readers in data/ convert Excel dates and numbers first).
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

// Excel counts days from 1899-12-30. Serials in this range are 1954–2119,
// which keeps a plain number such as a quantity from being read as a date.
const EXCEL_EPOCH: IsoDate = "1899-12-30"
const EXCEL_SERIAL_MIN = 20000
const EXCEL_SERIAL_MAX = 80000

function iso(year: number, month: number, day: number): IsoDate | null {
  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return isIsoDate(value) ? value : null
}

/**
 * Accepts 2026-10-29, 29/10/2026 (South African day-first order, also with
 * "." or "-" and two-digit years), 29 Oct 2026, and Excel date serials.
 * Returns null when the text isn't a real date, e.g. 31/02/2026.
 */
export function parseImportDate(raw: string): IsoDate | null {
  const value = raw.trim()
  if (!value) return null

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/)
  if (isoMatch) return iso(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]))

  const dayFirst = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/)
  if (dayFirst) {
    const year = dayFirst[3].length === 2 ? 2000 + Number(dayFirst[3]) : Number(dayFirst[3])
    return iso(year, Number(dayFirst[2]), Number(dayFirst[1]))
  }

  const named = value.match(/^(\d{1,2})[\s-]+([a-z]{3,})\.?[\s,-]+(\d{4})$/i)
  if (named) {
    const month = MONTHS.indexOf(named[2].slice(0, 3).toLowerCase())
    return month >= 0 ? iso(Number(named[3]), month + 1, Number(named[1])) : null
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    const serial = Math.floor(Number(value))
    if (serial >= EXCEL_SERIAL_MIN && serial <= EXCEL_SERIAL_MAX) return addDays(EXCEL_EPOCH, serial)
  }
  return null
}

/** Blank means 1; otherwise a whole number of at least 1, or null if it isn't one. */
export function parseQuantity(raw: string): number | null {
  const value = raw.trim()
  if (!value) return 1
  const quantity = Number(value.replace(",", "."))
  return Number.isInteger(quantity) && quantity >= 1 ? quantity : null
}

const RETURNED_WORDS = ["yes", "y", "true", "1", "x", "✓", "returned", "back", "done"]

/**
 * The "Returned" (or "Status") column: a date, or a clear word like yes /
 * returned / x, means the loan came back. Anything else ("Overdue", "On
 * loan", blank) keeps it out: wrongly closing a loan hides a missing item,
 * while wrongly leaving one open is visible and easy to fix.
 */
export function parseReturned(raw: string): { returned: false } | { returned: true; on: IsoDate | null } {
  const date = parseImportDate(raw)
  if (date) return { returned: true, on: date }
  return RETURNED_WORDS.includes(raw.trim().toLowerCase()) ? { returned: true, on: null } : { returned: false }
}
