import { createId } from "@/shared/lib/ids"
import { isIsoDate } from "@/shared/lib/dates"
import { isRecord } from "./storage-types"

/**
 * Converts one pre-v1.0 loan (a flat row: one item per loan) into the v1 shape
 * with a borrower block and line items. Older builds used different field
 * names, so each field accepts the common spellings. Anything we can't read is
 * kept in notes rather than thrown away.
 */

type Raw = Record<string, unknown>

function pick(record: Raw, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return record[key]
  }
  return undefined
}

function text(value: unknown): string {
  return value === undefined ? "" : String(value).trim()
}

/** Accepts "2026-10-29", "2026-10-29T08:00:00Z" or "29/10/2026". */
export function legacyDate(value: unknown): string | undefined {
  const raw = text(value)
  if (!raw) return undefined
  if (isIsoDate(raw.slice(0, 10))) return raw.slice(0, 10)
  const dmy = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (dmy) {
    const iso = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
    if (isIsoDate(iso)) return iso
  }
  const parsed = Date.parse(raw)
  return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString().slice(0, 10)
}

function legacyTimestamp(value: unknown): string | undefined {
  const raw = text(value)
  if (!raw) return undefined
  const parsed = Date.parse(raw.length === 10 ? `${raw}T12:00:00Z` : raw)
  return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString()
}

function truthy(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "yes"
}

export function legacyRecordToLoan(record: unknown): unknown {
  // Not an object at all: keep it so validation quarantines it, never lose it.
  if (!isRecord(record)) return record

  const quantity = Math.max(1, Math.round(Number(pick(record, "quantity", "qty", "count")) || 1))
  const status = text(pick(record, "status")).toLowerCase()
  const returned = truthy(pick(record, "returned", "isReturned")) || status === "returned"
  const startDate = legacyDate(pick(record, "startDate", "loanDate", "dateIssued", "issueDate", "dateOut"))
  const dueDate = legacyDate(pick(record, "expectedReturnDate", "returnDate", "dueDate", "expectedReturn"))
  const original = legacyDate(pick(record, "originalReturnDate", "originalDueDate"))
  const createdAt = legacyTimestamp(pick(record, "createdAt", "created", "dateCreated")) ?? legacyTimestamp(startDate) ?? new Date().toISOString()
  const returnedAt = returned
    ? (legacyTimestamp(pick(record, "returnedAt", "returnedDate", "dateReturned", "actualReturnDate")) ?? createdAt)
    : undefined

  return {
    id: text(pick(record, "id", "loanId")) || createId(),
    borrower: {
      name: text(pick(record, "borrowerName", "borrower", "name", "clientName", "client")),
      cellphone: text(pick(record, "cellphone", "cellphoneNumber", "phone", "cell", "mobile")),
      whatsapp: text(pick(record, "whatsapp", "whatsappNumber", "whatsApp")),
      department: text(pick(record, "department", "section", "dept")),
      employeeNumber: text(pick(record, "employeeNumber", "workNumber", "employeeNo", "staffNumber")),
    },
    lines: [
      {
        id: createId(),
        description: text(pick(record, "itemDescription", "item", "description", "itemName", "items")),
        quantity,
        quantityReturned: returned ? quantity : 0,
      },
    ],
    startDate: startDate ?? dueDate,
    expectedReturnDate: dueDate ?? startDate,
    ...(original && original !== dueDate ? { originalReturnDate: original } : {}),
    issuedBy: text(pick(record, "issuedBy", "issuingStaff", "staff", "staffMember")),
    notes: text(pick(record, "notes", "note", "comments")),
    createdAt,
    updatedAt: legacyTimestamp(pick(record, "updatedAt")) ?? createdAt,
    ...(returnedAt ? { returnedAt } : {}),
    isDemo: truthy(pick(record, "isSample", "isDemo", "sample")),
  }
}
