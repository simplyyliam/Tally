import type { IsoDate } from "@/shared/lib/dates"
import { normalizeName } from "@/shared/lib/text"
import type { Loan } from "./loan"
import { isDueTomorrow, loanStatus, overdueDays, type LoanStatus } from "./status"

/** Search, tabs and sorting for the loan list. */

export type LoanTab = "out" | "overdue" | "due-today" | "due-tomorrow" | "returned" | "all"

export const LOAN_TABS: ReadonlyArray<{ id: LoanTab; label: string }> = [
  { id: "out", label: "Out" },
  { id: "overdue", label: "Overdue" },
  { id: "due-today", label: "Due today" },
  { id: "due-tomorrow", label: "Due tomorrow" },
  { id: "returned", label: "Returned" },
  { id: "all", label: "All" },
]

export type LoanSort = "due-date" | "start-date" | "borrower" | "newest" | "overdue-days"

export const LOAN_SORTS: ReadonlyArray<{ id: LoanSort; label: string }> = [
  { id: "due-date", label: "Return date" },
  { id: "overdue-days", label: "Most overdue" },
  { id: "start-date", label: "Start date" },
  { id: "borrower", label: "Borrower" },
  { id: "newest", label: "Newest first" },
]

export function matchesTab(loan: Loan, tab: LoanTab, today: IsoDate): boolean {
  const status: LoanStatus = loanStatus(loan, today)
  switch (tab) {
    case "out":
      return status !== "returned"
    case "overdue":
      return status === "overdue"
    case "due-today":
      return status === "due-today"
    case "due-tomorrow":
      return isDueTomorrow(loan, today)
    case "returned":
      return status === "returned"
    case "all":
      return true
  }
}

/** Every word typed must appear somewhere on the loan (borrower, items, reference, phone…). */
export function matchesSearch(loan: Loan, query: string): boolean {
  const words = normalizeName(query).split(" ").filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalizeName(
    [
      loan.borrower.name,
      loan.borrower.cellphone,
      loan.borrower.whatsapp,
      loan.borrower.department,
      loan.borrower.employeeNumber,
      loan.issuedBy,
      loan.notes,
      loan.reference,
      ...loan.lines.map((line) => line.description),
    ].join(" "),
  )
  return words.every((word) => haystack.includes(word))
}

export function sortLoans(loans: ReadonlyArray<Loan>, sort: LoanSort, today: IsoDate): Loan[] {
  const sorted = [...loans]
  const byText = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base" })
  switch (sort) {
    case "due-date":
      return sorted.sort((a, b) => byText(a.expectedReturnDate, b.expectedReturnDate) || byText(a.borrower.name, b.borrower.name))
    case "overdue-days":
      return sorted.sort((a, b) => overdueDays(b, today) - overdueDays(a, today) || byText(a.expectedReturnDate, b.expectedReturnDate))
    case "start-date":
      return sorted.sort((a, b) => byText(b.startDate, a.startDate))
    case "borrower":
      return sorted.sort((a, b) => byText(a.borrower.name, b.borrower.name))
    case "newest":
      return sorted.sort((a, b) => byText(b.createdAt, a.createdAt))
  }
}

export function countByTab(loans: ReadonlyArray<Loan>, today: IsoDate): Record<LoanTab, number> {
  const counts: Record<LoanTab, number> = { out: 0, overdue: 0, "due-today": 0, "due-tomorrow": 0, returned: 0, all: 0 }
  for (const loan of loans) {
    for (const tab of LOAN_TABS) {
      if (matchesTab(loan, tab.id, today)) counts[tab.id]++
    }
  }
  return counts
}
