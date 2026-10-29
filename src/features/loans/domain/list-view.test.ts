import { describe, expect, it } from "vitest"
import { countByTab, matchesSearch, matchesTab, sortLoans } from "./list-view"
import { makeLine, makeLoan } from "./test-loans"

const today = "2026-10-29"
const overdue = makeLoan({ id: "overdue", expectedReturnDate: "2026-10-20", borrower: { ...makeLoan().borrower, name: "Zanele" } })
const dueToday = makeLoan({ id: "today", expectedReturnDate: today, borrower: { ...makeLoan().borrower, name: "Ayanda" } })
const returned = makeLoan({ id: "returned", lines: [makeLine({ quantityReturned: 1 })] })

describe("loan list tabs", () => {
  it("the Out tab shows every loan with something still out", () => {
    expect([overdue, dueToday, returned].filter((loan) => matchesTab(loan, "out", today)).map((loan) => loan.id)).toEqual([
      "overdue",
      "today",
    ])
  })

  it("the Returned tab shows only fully returned loans", () => {
    expect(matchesTab(returned, "returned", today)).toBe(true)
    expect(matchesTab(overdue, "returned", today)).toBe(false)
  })

  it("counts every tab at once", () => {
    const counts = countByTab([overdue, dueToday, returned], today)
    expect(counts).toMatchObject({ out: 2, overdue: 1, "due-today": 1, returned: 1, all: 3 })
  })
})

describe("search", () => {
  it("finds a loan by any word of the borrower, item or department", () => {
    expect(matchesSearch(overdue, "zan cord")).toBe(true)
    expect(matchesSearch(overdue, "maintenance")).toBe(true)
    expect(matchesSearch(overdue, "projector")).toBe(false)
  })

  it("an empty search matches everything", () => {
    expect(matchesSearch(overdue, "  ")).toBe(true)
  })
})

describe("sorting", () => {
  it("sorts by return date, soonest first", () => {
    expect(sortLoans([dueToday, overdue], "due-date", today).map((loan) => loan.id)).toEqual(["overdue", "today"])
  })

  it("sorts by borrower name", () => {
    expect(sortLoans([overdue, dueToday], "borrower", today).map((loan) => loan.borrower.name)).toEqual(["Ayanda", "Zanele"])
  })
})
