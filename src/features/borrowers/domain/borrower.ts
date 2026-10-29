import { z } from "zod"
import type { IsoDate } from "@/shared/lib/dates"
import { normalizePhone } from "@/shared/lib/phone"
import { normalizeName } from "@/shared/lib/text"
import { loanStatus, outstandingLines, outstandingQuantity, remainingQuantity, type BorrowerDetails, type Loan } from "@/features/loans"

/**
 * Borrowers are not typed in separately: they are worked out from the loans.
 * Two loans belong to the same person when their cellphone numbers match;
 * without a number, we fall back to the name. The newest loan's details
 * (phone, department…) are taken as current.
 */

export interface OutstandingItem {
  loanId: string
  reference: string
  description: string
  quantity: number
  dueDate: IsoDate
}

export interface Borrower {
  key: string
  details: BorrowerDetails
  /** Newest first. */
  loans: Loan[]
  openLoanCount: number
  overdueLoanCount: number
  itemsOut: number
  outstanding: OutstandingItem[]
  lastLoanAt: string
}

/** Stored per borrower: things that aren't part of any one loan. */
export const borrowerPreferenceSchema = z.object({
  key: z.string().min(1),
  /** POPIA: may we contact this person on WhatsApp? Defaults to yes. */
  whatsappConsent: z.boolean().default(true),
  updatedAt: z.string(),
})

export type BorrowerPreference = z.infer<typeof borrowerPreferenceSchema>

/** "phone:27821234567" or "name:thandi nkosi". */
export function borrowerKey(details: Pick<BorrowerDetails, "name" | "cellphone" | "whatsapp">): string {
  const phone = normalizePhone(details.cellphone) ?? normalizePhone(details.whatsapp)
  return phone ? `phone:${phone}` : `name:${normalizeName(details.name)}`
}

export function deriveBorrowers(loans: ReadonlyArray<Loan>, today: IsoDate): Borrower[] {
  const groups = new Map<string, Loan[]>()
  for (const loan of loans) {
    const key = borrowerKey(loan.borrower)
    groups.set(key, [...(groups.get(key) ?? []), loan])
  }
  return [...groups.entries()]
    .map(([key, group]) => summarise(key, group, today))
    .sort((a, b) => a.details.name.localeCompare(b.details.name, "en", { sensitivity: "base" }))
}

function summarise(key: string, group: Loan[], today: IsoDate): Borrower {
  const loans = [...group].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const open = loans.filter((loan) => loanStatus(loan, today) !== "returned")
  return {
    key,
    details: loans[0].borrower,
    loans,
    openLoanCount: open.length,
    overdueLoanCount: open.filter((loan) => loanStatus(loan, today) === "overdue").length,
    itemsOut: open.reduce((sum, loan) => sum + outstandingQuantity(loan), 0),
    outstanding: open.flatMap((loan) =>
      outstandingLines(loan).map((line) => ({
        loanId: loan.id,
        reference: loan.reference,
        description: line.description,
        quantity: remainingQuantity(line),
        dueDate: loan.expectedReturnDate,
      })),
    ),
    lastLoanAt: loans[0].createdAt,
  }
}

/**
 * Past borrowers whose name matches what's typed: names starting with the
 * text come first, then names containing it; ties go to the most recent.
 */
export function suggestBorrowers(borrowers: ReadonlyArray<Borrower>, query: string, limit = 6): Borrower[] {
  const typed = normalizeName(query)
  if (!typed) return []
  const scored = borrowers
    .map((borrower) => {
      const name = normalizeName(borrower.details.name)
      const words = name.split(" ")
      const score = name.startsWith(typed) ? 0 : words.some((word) => word.startsWith(typed)) ? 1 : name.includes(typed) ? 2 : -1
      return { borrower, score }
    })
    .filter(({ score, borrower }) => score >= 0 && normalizeName(borrower.details.name) !== typed)
  return scored
    .sort((a, b) => a.score - b.score || b.borrower.lastLoanAt.localeCompare(a.borrower.lastLoanAt))
    .slice(0, limit)
    .map(({ borrower }) => borrower)
}

export function findBorrower(borrowers: ReadonlyArray<Borrower>, key: string): Borrower | undefined {
  return borrowers.find((borrower) => borrower.key === key)
}
