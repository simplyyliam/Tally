import { describe, expect, it } from "vitest"
import { LoanChangeError, createLoan, editLoan, extendLoan, returnAllItems, draftFromLoan } from "./changes"
import { makeLine, makeLoan } from "./test-loans"

let counter = 0
const context = { at: "2026-10-29T10:00:00.000Z", createId: () => `id-${++counter}` }

describe("creating and editing loans", () => {
  it("a new loan starts with nothing returned", () => {
    const loan = createLoan(
      {
        borrower: { name: "Sipho", cellphone: "", whatsapp: "", department: "", employeeNumber: "" },
        lines: [
          { description: "Cord", quantity: 3 },
          { description: "Projector", quantity: 1 },
        ],
        startDate: "2026-10-29",
        expectedReturnDate: "2026-11-05",
        issuedBy: "Liam",
        notes: "",
        isDemo: false,
      },
      { ...context, reference: "LN-2026-0042" },
    )
    expect(loan.lines.map((line) => line.quantityReturned)).toEqual([0, 0])
    expect(loan.reference).toBe("LN-2026-0042")
    expect(loan.createdAt).toBe(context.at)
    expect(loan.issuedAt).toBe(context.at)
    expect(loan.extendedAt).toEqual([])
  })

  it("editing keeps quantities already returned", () => {
    const loan = makeLoan({ lines: [makeLine({ quantity: 3, quantityReturned: 2 })] })
    const edited = editLoan(loan, { ...draftFromLoan(loan), notes: "Checked" }, context)
    expect(edited.lines[0].quantityReturned).toBe(2)
    expect(edited.notes).toBe("Checked")
  })

  it("editing the return date remembers the first agreed date", () => {
    const loan = makeLoan({ expectedReturnDate: "2026-10-27" })
    const edited = editLoan(loan, { ...draftFromLoan(loan), expectedReturnDate: "2026-11-02" }, context)
    expect(edited.originalReturnDate).toBe("2026-10-27")
  })
})

describe("returning and extending", () => {
  it("returning all marks every line fully back and stamps the time", () => {
    const loan = makeLoan({ lines: [makeLine({ quantity: 3, quantityReturned: 1 }), makeLine({ id: "b", quantity: 2 })] })
    const returned = returnAllItems(loan, context.at)
    expect(returned.lines.every((line) => line.quantityReturned === line.quantity)).toBe(true)
    expect(returned.returnedAt).toBe(context.at)
  })

  it("extending moves the return date and keeps the original", () => {
    const extended = extendLoan(makeLoan({ expectedReturnDate: "2026-10-27" }), "2026-11-03", context.at)
    expect(extended.expectedReturnDate).toBe("2026-11-03")
    expect(extended.originalReturnDate).toBe("2026-10-27")
  })

  it("every extension is time-stamped", () => {
    const once = extendLoan(makeLoan(), "2026-11-03", "2026-10-29T10:00:00.000Z")
    const twice = extendLoan(once, "2026-11-10", "2026-11-02T09:00:00.000Z")
    expect(twice.extendedAt).toEqual(["2026-10-29T10:00:00.000Z", "2026-11-02T09:00:00.000Z"])
  })

  it("moving the return date later in the edit form also counts as an extension", () => {
    const loan = makeLoan({ expectedReturnDate: "2026-10-27" })
    const edited = editLoan(loan, { ...draftFromLoan(loan), expectedReturnDate: "2026-11-02" }, context)
    expect(edited.extendedAt).toEqual([context.at])
  })

  it("extending twice keeps the very first agreed date", () => {
    const once = extendLoan(makeLoan({ expectedReturnDate: "2026-10-27" }), "2026-11-03", context.at)
    const twice = extendLoan(once, "2026-11-10", context.at)
    expect(twice.originalReturnDate).toBe("2026-10-27")
  })

  it("a loan can't be extended to before it started", () => {
    expect(() => extendLoan(makeLoan({ startDate: "2026-10-20" }), "2026-10-01", context.at)).toThrow(LoanChangeError)
  })
})
