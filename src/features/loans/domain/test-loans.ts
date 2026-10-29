import type { Loan, LoanLine } from "./loan"

/** Builds loans for tests with sensible defaults, so each test states only what matters to it. */
export function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: "loan-1",
    borrower: { name: "Thandi Nkosi", cellphone: "082 123 4567", whatsapp: "", department: "Maintenance", employeeNumber: "E1042" },
    lines: [makeLine()],
    startDate: "2026-10-20",
    expectedReturnDate: "2026-10-27",
    issuedBy: "Liam",
    notes: "",
    createdAt: "2026-10-20T08:00:00.000Z",
    updatedAt: "2026-10-20T08:00:00.000Z",
    isDemo: false,
    ...overrides,
  }
}

export function makeLine(overrides: Partial<LoanLine> = {}): LoanLine {
  return { id: "line-1", description: "Extension cord", quantity: 1, quantityReturned: 0, ...overrides }
}
