import type { IsoDate } from "@/shared/lib/dates"
import { isValidPhone } from "@/shared/lib/phone"
import type { LoanDraft } from "@/features/loans"
import type { ColumnMapping, ImportFieldId } from "./import-fields"
import { parseImportDate, parseQuantity, parseReturned } from "./import-values"

/** One loan ready to save, with the spreadsheet rows it came from (1-based, header = row 1). */
export interface ImportedLoan {
  rows: number[]
  draft: LoanDraft
  /** Set when the Returned column says it already came back. */
  returnedOn: IsoDate | "unknown-date" | null
}

export interface SkippedRow {
  row: number
  reasons: string[]
}

export interface RowWarning {
  row: number
  message: string
}

export interface ImportPlan {
  loans: ImportedLoan[]
  skipped: SkippedRow[]
  warnings: RowWarning[]
}

/**
 * Turns spreadsheet rows (header row removed) into loan drafts.
 *
 * A row is skipped only when the loan can't exist without what's missing: a
 * borrower, an item, a usable return date. A phone number that doesn't look
 * right is not a reason to drop a loan: the row is imported without it, the
 * number goes into the notes so nothing is lost, and the row is listed as a
 * warning. Rows sharing a value in the "Loan number" column become one loan
 * with several items (this is how Tally's own CSV export lays them out).
 */
export function buildImport(rows: ReadonlyArray<ReadonlyArray<string>>, mapping: ColumnMapping, today: IsoDate): ImportPlan {
  const plan: ImportPlan = { loans: [], skipped: [], warnings: [] }
  const byReference = new Map<string, ImportedLoan>()

  rows.forEach((cells, index) => {
    const row = index + 2
    const cell = (field: ImportFieldId) => {
      const column = mapping[field]
      return column === null ? "" : (cells[column] ?? "").trim()
    }
    if (cells.every((value) => !value.trim())) return

    const reasons: string[] = []
    const name = cell("borrowerName")
    const item = cell("item")
    const quantity = parseQuantity(cell("quantity"))
    const dueText = cell("expectedReturnDate")
    const due = parseImportDate(dueText)
    const startText = cell("startDate")
    const start = startText ? parseImportDate(startText) : defaultStart(due, today)

    if (!name) reasons.push("No borrower name")
    if (!item) reasons.push("No item")
    if (quantity === null) reasons.push(`Quantity "${cell("quantity")}" isn't a whole number`)
    if (!dueText) reasons.push("No return date")
    else if (!due) reasons.push(`Return date "${dueText}" isn't a date`)
    if (startText && !start) reasons.push(`Start date "${startText}" isn't a date`)
    if (due && start && due < start) reasons.push("Return date is before the start date")
    if (reasons.length > 0 || !due || !start || quantity === null) {
      plan.skipped.push({ row, reasons })
      return
    }

    const notes = [cell("notes")]
    const phone = (field: "cellphone" | "whatsapp", label: string) => {
      const value = cell(field)
      if (!value || isValidPhone(value)) return value
      plan.warnings.push({ row, message: `${label} "${value}" doesn't look right, so it was put in the notes` })
      notes.push(`${label} as imported: ${value}`)
      return ""
    }
    const borrower = {
      name,
      cellphone: phone("cellphone", "Cellphone"),
      whatsapp: phone("whatsapp", "WhatsApp"),
      department: cell("department"),
      employeeNumber: cell("employeeNumber"),
    }
    const returned = parseReturned(cell("returned"))
    const returnedOn = returned.returned ? (returned.on ?? "unknown-date") : null

    const reference = cell("reference")
    const existing = reference ? byReference.get(reference) : undefined
    if (existing) {
      existing.rows.push(row)
      existing.draft.lines.push({ description: item, quantity })
      return
    }
    const loan: ImportedLoan = {
      rows: [row],
      returnedOn,
      draft: {
        borrower,
        lines: [{ description: item, quantity }],
        startDate: start,
        expectedReturnDate: due,
        issuedBy: cell("issuedBy"),
        notes: notes.filter(Boolean).join("\n"),
        isDemo: false,
      },
    }
    plan.loans.push(loan)
    if (reference) byReference.set(reference, loan)
  })
  return plan
}

/** No start date column: assume it went out today, or on the due date if that's already past. */
function defaultStart(due: IsoDate | null, today: IsoDate): IsoDate | null {
  if (!due) return today
  return due < today ? due : today
}
