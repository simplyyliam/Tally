import { normalizeName } from "@/shared/lib/text"

/**
 * The loan fields a spreadsheet column can fill. Each lists the header
 * spellings we've seen in paper-register spreadsheets, so most files map
 * themselves and staff only fix the odd column.
 */
export const IMPORT_FIELDS = [
  { id: "borrowerName", label: "Borrower name", required: true, aliases: ["borrower", "name", "borrower name", "full name", "client", "person"] },
  { id: "cellphone", label: "Cellphone", required: false, aliases: ["cellphone", "cell", "phone", "mobile", "cell number", "contact", "tel"] },
  { id: "whatsapp", label: "WhatsApp", required: false, aliases: ["whatsapp", "whatsapp number"] },
  { id: "department", label: "Department", required: false, aliases: ["department", "dept", "section", "division"] },
  { id: "employeeNumber", label: "Employee number", required: false, aliases: ["employee number", "employee no", "work number", "staff number", "emp no"] },
  { id: "item", label: "Item", required: true, aliases: ["item", "items", "item name", "description", "item description", "equipment", "asset"] },
  { id: "quantity", label: "Quantity", required: false, aliases: ["quantity", "qty", "count", "number", "no of items"] },
  { id: "startDate", label: "Start date", required: false, aliases: ["start date", "date out", "issued", "issue date", "loan date", "date issued", "start"] },
  { id: "expectedReturnDate", label: "Return date", required: true, aliases: ["return date", "due date", "expected return", "expected return date", "due", "date due"] },
  { id: "issuedBy", label: "Issued by", required: false, aliases: ["issued by", "staff", "issuing staff", "handed over by"] },
  { id: "notes", label: "Notes", required: false, aliases: ["notes", "note", "comments", "remarks"] },
  { id: "returned", label: "Returned", required: false, aliases: ["returned", "status", "date returned", "returned on", "returned date"] },
  { id: "reference", label: "Loan number (groups rows)", required: false, aliases: ["reference", "ref", "loan number", "loan no", "loan reference"] },
] as const

export type ImportFieldId = (typeof IMPORT_FIELDS)[number]["id"]

/** Which column (by index) fills each field; null = not imported. */
export type ColumnMapping = Record<ImportFieldId, number | null>

function simplify(header: string): string {
  return normalizeName(header).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Guesses the mapping from the header row. Every (field, column) pair gets a
 * score: an exact alias beats a whole word inside the header, and a longer
 * alias beats a shorter one. Pairs are then taken best-first, each column
 * once, so "Return date" can't also be taken as "Start date".
 */
export function guessMapping(headers: ReadonlyArray<string>): ColumnMapping {
  const simplified = headers.map(simplify)
  const candidates: { field: ImportFieldId; column: number; score: number }[] = []
  for (const field of IMPORT_FIELDS) {
    simplified.forEach((header, column) => {
      const score = Math.max(0, ...field.aliases.map((alias) => aliasScore(header, alias)))
      if (score > 0) candidates.push({ field: field.id, column, score })
    })
  }
  candidates.sort((a, b) => b.score - a.score)

  const mapping = Object.fromEntries(IMPORT_FIELDS.map((field) => [field.id, null])) as ColumnMapping
  const taken = new Set<number>()
  for (const { field, column } of candidates) {
    if (mapping[field] !== null || taken.has(column)) continue
    mapping[field] = column
    taken.add(column)
  }
  return mapping
}

function aliasScore(header: string, alias: string): number {
  if (header === alias) return 1000 + alias.length
  return ` ${header} `.includes(` ${alias} `) ? alias.length : 0
}

/** Required fields that have no column yet. */
export function missingRequiredFields(mapping: ColumnMapping): string[] {
  return IMPORT_FIELDS.filter((field) => field.required && mapping[field.id] === null).map((field) => field.label)
}
