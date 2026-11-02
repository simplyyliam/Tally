import { addDays, daysBetween, type IsoDate } from "@/shared/lib/dates"
import type { Loan, LoanLine } from "./loan"

/**
 * Loan status rules. Status is never stored: it is worked out from the lines
 * and today's date every time, so it can't drift from the facts.
 *
 * Each line is either returned or still out. A loan is "returned" only when
 * every line is back; otherwise its due date decides whether it is on loan,
 * due today or overdue.
 */

export type LoanStatus = "on-loan" | "due-today" | "overdue" | "returned"

export const STATUS_LABELS: Record<LoanStatus, string> = {
  "on-loan": "On loan",
  "due-today": "Due today",
  overdue: "Overdue",
  returned: "Returned",
}

export function remainingQuantity(line: LoanLine): number {
  return Math.max(0, line.quantity - line.quantityReturned)
}

export function isLineReturned(line: LoanLine): boolean {
  return remainingQuantity(line) === 0
}

export function outstandingLines(loan: Loan): LoanLine[] {
  return loan.lines.filter((line) => !isLineReturned(line))
}

export function isFullyReturned(loan: Loan): boolean {
  return loan.lines.every(isLineReturned)
}

/** Some items are back but not all of them. */
export function isPartlyReturned(loan: Loan): boolean {
  return !isFullyReturned(loan) && loan.lines.some((line) => line.quantityReturned > 0)
}

export function totalQuantity(loan: Loan): number {
  return loan.lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function outstandingQuantity(loan: Loan): number {
  return loan.lines.reduce((sum, line) => sum + remainingQuantity(line), 0)
}

function statusForDueDate(dueDate: IsoDate, today: IsoDate): LoanStatus {
  if (today > dueDate) return "overdue"
  if (today === dueDate) return "due-today"
  return "on-loan"
}

/** Status of one line: a returned line stays returned even while the rest of the loan is late. */
export function lineStatus(line: LoanLine, loan: Loan, today: IsoDate): LoanStatus {
  if (isLineReturned(line)) return "returned"
  return statusForDueDate(loan.expectedReturnDate, today)
}

/** Rolls the line statuses up to the loan. */
export function loanStatus(loan: Loan, today: IsoDate): LoanStatus {
  if (isFullyReturned(loan)) return "returned"
  return statusForDueDate(loan.expectedReturnDate, today)
}

/** Days past the expected return date; 0 when returned or not yet due. */
export function overdueDays(loan: Loan, today: IsoDate): number {
  if (isFullyReturned(loan)) return 0
  return Math.max(0, daysBetween(loan.expectedReturnDate, today))
}

export function isDueTomorrow(loan: Loan, today: IsoDate): boolean {
  return !isFullyReturned(loan) && loan.expectedReturnDate === addDays(today, 1)
}

/** True once the return date has been moved from the first agreed date. */
export function isExtended(loan: Loan): boolean {
  return loan.originalReturnDate !== undefined && loan.originalReturnDate !== loan.expectedReturnDate
}

/** "2 × Extension cord, 1 × Projector" */
export function describeLines(lines: ReadonlyArray<LoanLine>): string {
  return lines.map((line) => `${line.quantity} × ${line.description}`).join(", ")
}
