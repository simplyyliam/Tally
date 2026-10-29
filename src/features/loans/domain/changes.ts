import type { IsoDate } from "@/shared/lib/dates"
import type { Loan, LoanDraft } from "./loan"

/**
 * Pure functions that produce the next version of a loan. They never touch
 * storage; the repository saves whatever they return.
 */

export interface ChangeContext {
  /** ISO timestamp of the change. */
  at: string
  createId: () => string
}

export function createLoan(draft: LoanDraft, context: ChangeContext & { reference: string }): Loan {
  return {
    id: context.createId(),
    reference: context.reference,
    borrower: draft.borrower,
    lines: draft.lines.map((line) => ({
      id: context.createId(),
      description: line.description,
      quantity: line.quantity,
      quantityReturned: 0,
    })),
    startDate: draft.startDate,
    expectedReturnDate: draft.expectedReturnDate,
    issuedBy: draft.issuedBy,
    notes: draft.notes,
    createdAt: context.at,
    issuedAt: context.at,
    extendedAt: [],
    updatedAt: context.at,
    isDemo: draft.isDemo,
  }
}

/**
 * Applies an edit from the form. Lines are matched by position so quantities
 * already returned are kept; a line can't be edited below what has come back.
 */
export function editLoan(loan: Loan, draft: LoanDraft, context: ChangeContext): Loan {
  const lines = draft.lines.map((line, index) => {
    const existing = loan.lines[index]
    const quantityReturned = Math.min(existing?.quantityReturned ?? 0, line.quantity)
    return {
      id: existing?.id ?? context.createId(),
      description: line.description,
      quantity: line.quantity,
      quantityReturned,
    }
  })
  const dateChanged = draft.expectedReturnDate !== loan.expectedReturnDate
  // Moving the date later from the edit form counts as an extension, same as the Extend button.
  const extended = draft.expectedReturnDate > loan.expectedReturnDate
  return {
    ...loan,
    borrower: draft.borrower,
    lines,
    startDate: draft.startDate,
    expectedReturnDate: draft.expectedReturnDate,
    issuedBy: draft.issuedBy,
    notes: draft.notes,
    originalReturnDate: dateChanged ? (loan.originalReturnDate ?? loan.expectedReturnDate) : loan.originalReturnDate,
    extendedAt: extended ? [...loan.extendedAt, context.at] : loan.extendedAt,
    updatedAt: context.at,
  }
}

export class LoanChangeError extends Error {}

/** Marks every line as fully returned. */
export function returnAllItems(loan: Loan, at: string): Loan {
  return returnLines(
    loan,
    Object.fromEntries(loan.lines.map((line) => [line.id, line.quantity - line.quantityReturned])),
    at,
  )
}

/**
 * Records items coming back, per line: { lineId: how many came back now }.
 *
 * A partial return keeps the loan open on purpose: whatever is still out
 * remains the borrower's responsibility, keeps its due date and still turns
 * overdue. The loan only counts as returned once every line is back.
 */
export function returnLines(loan: Loan, returning: Readonly<Record<string, number>>, at: string): Loan {
  for (const [lineId, count] of Object.entries(returning)) {
    const line = loan.lines.find((candidate) => candidate.id === lineId)
    if (!line) throw new LoanChangeError("That item isn't on this loan.")
    if (!Number.isInteger(count) || count < 0) throw new LoanChangeError("Return a whole number of items.")
    if (count > line.quantity - line.quantityReturned) {
      throw new LoanChangeError(`Only ${line.quantity - line.quantityReturned} × ${line.description} still out.`)
    }
  }
  const lines = loan.lines.map((line) => {
    const count = returning[line.id] ?? 0
    if (count === 0) return line
    const quantityReturned = line.quantityReturned + count
    return { ...line, quantityReturned, returnedAt: quantityReturned === line.quantity ? at : line.returnedAt }
  })
  const allBack = lines.every((line) => line.quantityReturned === line.quantity)
  return { ...loan, lines, returnedAt: allBack ? (loan.returnedAt ?? at) : undefined, updatedAt: at }
}

/**
 * Moves the expected return date. The first agreed date is remembered in
 * originalReturnDate so the list can show that the loan was extended.
 */
export function extendLoan(loan: Loan, newReturnDate: IsoDate, at: string): Loan {
  if (newReturnDate < loan.startDate) {
    throw new LoanChangeError("The new return date can't be before the loan started.")
  }
  if (newReturnDate === loan.expectedReturnDate) {
    throw new LoanChangeError("Pick a different return date to extend the loan.")
  }
  return {
    ...loan,
    originalReturnDate: loan.originalReturnDate ?? loan.expectedReturnDate,
    expectedReturnDate: newReturnDate,
    extendedAt: [...loan.extendedAt, at],
    updatedAt: at,
  }
}

/** The form values for editing an existing loan. */
export function draftFromLoan(loan: Loan): LoanDraft {
  return {
    borrower: loan.borrower,
    lines: loan.lines.map((line) => ({ description: line.description, quantity: line.quantity })),
    startDate: loan.startDate,
    expectedReturnDate: loan.expectedReturnDate,
    issuedBy: loan.issuedBy,
    notes: loan.notes,
    isDemo: loan.isDemo,
  }
}
