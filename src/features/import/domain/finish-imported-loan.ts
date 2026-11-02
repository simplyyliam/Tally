import { returnAllItems, type Loan } from "@/features/loans"
import type { IsoDate } from "@/shared/lib/dates"

/** Midday in Johannesburg, so the timestamp lands on the same calendar day there. */
function middayOn(date: IsoDate): string {
  return `${date}T10:00:00.000Z`
}

/**
 * A freshly created loan only knows "now". An imported one happened earlier:
 * it was issued on its start date, and may already be back. createdAt stays
 * as the import moment, which is when it entered Tally.
 */
export function finishImportedLoan(loan: Loan, returnedOn: IsoDate | "unknown-date" | null, importedAt: string): Loan {
  const issuedAt = middayOn(loan.startDate) < importedAt ? middayOn(loan.startDate) : loan.issuedAt
  const issued = { ...loan, issuedAt }
  if (!returnedOn) return issued
  return returnAllItems(issued, returnedOn === "unknown-date" ? importedAt : middayOn(returnedOn))
}
