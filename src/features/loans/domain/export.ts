import type { IsoDate } from "@/shared/lib/dates"
import type { Loan } from "./loan"
import { STATUS_LABELS, lineStatus, overdueDays, remainingQuantity } from "./status"

/**
 * Rows for the Excel-compatible CSV export: one row per item line, so a loan
 * of "3 cords and a projector" stays readable in a spreadsheet.
 */
export const EXPORT_HEADERS = [
  "Reference",
  "Borrower",
  "Cellphone",
  "WhatsApp",
  "Department",
  "Employee number",
  "Item",
  "Quantity",
  "Quantity returned",
  "Quantity out",
  "Start date",
  "Expected return date",
  "Original return date",
  "Status",
  "Days overdue",
  "Issued by",
  "Notes",
  "Created at",
  "Issued at",
  "Extended at",
  "Returned at",
] as const

export function loansToCsvRows(loans: ReadonlyArray<Loan>, today: IsoDate): string[][] {
  const rows: string[][] = [[...EXPORT_HEADERS]]
  for (const loan of loans) {
    for (const line of loan.lines) {
      rows.push([
        loan.reference,
        loan.borrower.name,
        loan.borrower.cellphone,
        loan.borrower.whatsapp,
        loan.borrower.department,
        loan.borrower.employeeNumber,
        line.description,
        String(line.quantity),
        String(line.quantityReturned),
        String(remainingQuantity(line)),
        loan.startDate,
        loan.expectedReturnDate,
        loan.originalReturnDate ?? "",
        STATUS_LABELS[lineStatus(line, loan, today)],
        String(overdueDays(loan, today)),
        loan.issuedBy,
        loan.notes,
        loan.createdAt,
        loan.issuedAt,
        loan.extendedAt.join(" | "),
        loan.returnedAt ?? "",
      ])
    }
  }
  return rows
}
