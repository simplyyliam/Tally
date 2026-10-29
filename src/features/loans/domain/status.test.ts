import { describe, expect, it } from "vitest"
import { isDueTomorrow, isExtended, isPartlyReturned, lineStatus, loanStatus, outstandingQuantity, overdueDays } from "./status"
import { makeLine, makeLoan } from "./test-loans"

describe("loan status", () => {
  it("a loan due in the future with items out is on loan", () => {
    expect(loanStatus(makeLoan({ expectedReturnDate: "2026-11-05" }), "2026-10-29")).toBe("on-loan")
  })

  it("a loan due today is due today", () => {
    expect(loanStatus(makeLoan({ expectedReturnDate: "2026-10-29" }), "2026-10-29")).toBe("due-today")
  })

  it("a loan due yesterday with one item out is overdue by 1 day", () => {
    const loan = makeLoan({ expectedReturnDate: "2026-10-28" })
    expect(loanStatus(loan, "2026-10-29")).toBe("overdue")
    expect(overdueDays(loan, "2026-10-29")).toBe(1)
  })

  it("a loan with every item back is returned, even after its due date", () => {
    const loan = makeLoan({ expectedReturnDate: "2026-10-01", lines: [makeLine({ quantity: 2, quantityReturned: 2 })] })
    expect(loanStatus(loan, "2026-10-29")).toBe("returned")
    expect(overdueDays(loan, "2026-10-29")).toBe(0)
  })

  it("a loan not yet due is overdue by 0 days", () => {
    expect(overdueDays(makeLoan({ expectedReturnDate: "2026-11-01" }), "2026-10-29")).toBe(0)
  })

  it("overdue days count across a month boundary", () => {
    expect(overdueDays(makeLoan({ expectedReturnDate: "2026-09-30" }), "2026-10-02")).toBe(2)
  })
})

describe("line status rolls up to the loan", () => {
  const loan = makeLoan({
    expectedReturnDate: "2026-10-27",
    lines: [
      makeLine({ id: "a", description: "Cord", quantity: 3, quantityReturned: 3 }),
      makeLine({ id: "b", description: "Projector", quantity: 1, quantityReturned: 0 }),
    ],
  })

  it("a returned line stays returned while the rest of the loan is late", () => {
    expect(lineStatus(loan.lines[0], loan, "2026-10-29")).toBe("returned")
    expect(lineStatus(loan.lines[1], loan, "2026-10-29")).toBe("overdue")
  })

  it("the loan is overdue while any line is still out", () => {
    expect(loanStatus(loan, "2026-10-29")).toBe("overdue")
  })

  it("a loan with some lines back is partly returned", () => {
    expect(isPartlyReturned(loan)).toBe(true)
    expect(outstandingQuantity(loan)).toBe(1)
  })
})

describe("due tomorrow and extensions", () => {
  it("a loan due the day after today is due tomorrow", () => {
    expect(isDueTomorrow(makeLoan({ expectedReturnDate: "2026-10-30" }), "2026-10-29")).toBe(true)
  })

  it("a returned loan is never due tomorrow", () => {
    const loan = makeLoan({ expectedReturnDate: "2026-10-30", lines: [makeLine({ quantityReturned: 1 })] })
    expect(isDueTomorrow(loan, "2026-10-29")).toBe(false)
  })

  it("a loan is extended once its return date moved from the first agreed date", () => {
    expect(isExtended(makeLoan())).toBe(false)
    expect(isExtended(makeLoan({ originalReturnDate: "2026-10-27", expectedReturnDate: "2026-11-03" }))).toBe(true)
  })
})
