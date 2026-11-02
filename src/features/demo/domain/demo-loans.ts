import { addDays, type IsoDate } from "@/shared/lib/dates"
import { formatLoanReference } from "@/shared/lib/loan-reference"
import { createLoan, extendLoan, returnAllItems, returnLines, type Loan, type LoanDraft } from "@/features/loans"

/**
 * Sample loans for trying Tally out, covering every status: overdue, due
 * today, due tomorrow, extended, partly returned and returned. They are
 * marked isDemo so "Clear demo data" removes exactly these and nothing real.
 *
 * Demo loans are numbered from 9001 up (LN-2026-9001…) and real loans ignore
 * demo numbers when counting, so loading the demo never uses up real
 * numbers: the first real loan is still LN-2026-0001.
 */
export const DEMO_SEQUENCE_START = 9001

interface DemoLoan {
  borrower: [name: string, cellphone: string, department: string, employeeNumber: string]
  lines: [description: string, quantity: number][]
  startOffset: number
  dueOffset: number
  /** What happened after the handover. */
  then?: (loan: Loan, at: string, today: IsoDate) => Loan
}

const DEMO_LOANS: DemoLoan[] = [
  { borrower: ["Thandi Nkosi", "082 555 0101", "Maintenance", "E1042"], lines: [["Extension cord", 3], ["Projector", 1]], startOffset: -10, dueOffset: -3 },
  { borrower: ["Sipho Dlamini", "082 555 0102", "Events", "E1107"], lines: [["Folding table", 6]], startOffset: -6, dueOffset: 0 },
  {
    borrower: ["Ayanda Mokoena", "082 555 0103", "Youth", "E1210"],
    lines: [["PA speaker", 2], ["Mic stand", 2], ["XLR cable", 4]],
    startOffset: -2,
    dueOffset: 1,
  },
  {
    borrower: ["Pieter van Wyk", "082 555 0104", "Grounds", "E0988"],
    lines: [["Ladder", 1]],
    startOffset: -20,
    dueOffset: -1,
    then: (loan, at, today) => extendLoan(loan, addDays(today, 5), at),
  },
  {
    borrower: ["Johan Botha", "082 555 0105", "Kitchen", "E1033"],
    lines: [["Urn", 2], ["Chafing dish", 4]],
    startOffset: -4,
    dueOffset: -1,
    then: (loan, at) => returnLines(loan, { [loan.lines[0].id]: 1 }, at),
  },
  {
    borrower: ["Lerato Khumalo", "082 555 0106", "Admin", "E1150"],
    lines: [["Laptop", 1]],
    startOffset: -30,
    dueOffset: -12,
    then: (loan, at) => returnAllItems(loan, at),
  },
  { borrower: ["Naledi Mthembu", "082 555 0107", "Library", "E1301"], lines: [["Camera", 1], ["Tripod", 1]], startOffset: -1, dueOffset: 6 },
  {
    borrower: ["Thandi Nkosi", "082 555 0101", "Maintenance", "E1042"],
    lines: [["Cordless drill", 1]],
    startOffset: -40,
    dueOffset: -33,
    then: (loan, at) => returnAllItems(loan, at),
  },
]

/** Builds the demo loans for today, ready to save. */
export function buildDemoLoans(today: IsoDate, at: string, createId: () => string): Loan[] {
  const year = Number(today.slice(0, 4))
  return DEMO_LOANS.map((demo, index) => {
    const [name, cellphone, department, employeeNumber] = demo.borrower
    const draft: LoanDraft = {
      borrower: { name, cellphone, whatsapp: "", department, employeeNumber },
      lines: demo.lines.map(([description, quantity]) => ({ description, quantity })),
      startDate: addDays(today, demo.startOffset),
      expectedReturnDate: addDays(today, demo.dueOffset),
      issuedBy: "Demo",
      notes: "Sample loan for trying Tally out.",
      isDemo: true,
    }
    const loan = createLoan(draft, { at, createId, reference: formatLoanReference(year, DEMO_SEQUENCE_START + index) })
    return demo.then ? demo.then(loan, at, today) : loan
  })
}
