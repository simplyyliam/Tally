import { describe, expect, it } from "vitest"
import { makeLine, makeLoan } from "@/features/loans/domain/test-loans"
import { borrowerKey, deriveBorrowers, suggestBorrowers } from "./borrower"

const today = "2026-10-29"
const thandi = { name: "Thandi Nkosi", cellphone: "082 123 4567", whatsapp: "", department: "Maintenance", employeeNumber: "E1042" }

describe("borrower matching", () => {
  it("matches the same person by cellphone, however the number was typed", () => {
    expect(borrowerKey({ ...thandi, cellphone: "+27 82 123 4567" })).toBe(borrowerKey(thandi))
  })

  it("falls back to the name when there is no number", () => {
    expect(borrowerKey({ name: "  sipho  dlamini ", cellphone: "", whatsapp: "" })).toBe("name:sipho dlamini")
  })
})

describe("deriving borrowers from loans", () => {
  const older = makeLoan({ id: "a", reference: "LN-2026-0001", borrower: { ...thandi, department: "Grounds" }, createdAt: "2026-09-01T08:00:00.000Z", lines: [makeLine({ quantityReturned: 1 })] })
  const newer = makeLoan({
    id: "b",
    reference: "LN-2026-0007",
    borrower: { ...thandi, cellphone: "0821234567" },
    createdAt: "2026-10-20T08:00:00.000Z",
    expectedReturnDate: "2026-10-27",
    lines: [makeLine({ id: "x", description: "Projector", quantity: 2, quantityReturned: 1 })],
  })
  const [borrower] = deriveBorrowers([older, newer], today)

  it("groups a person's loans and takes their newest details", () => {
    expect(borrower.loans.map((loan) => loan.id)).toEqual(["b", "a"])
    expect(borrower.details.department).toBe("Maintenance")
  })

  it("lists only what is still out", () => {
    expect(borrower.outstanding).toEqual([{ loanId: "b", reference: "LN-2026-0007", description: "Projector", quantity: 1, dueDate: "2026-10-27" }])
    expect(borrower.itemsOut).toBe(1)
    expect(borrower.overdueLoanCount).toBe(1)
  })
})

describe("suggestions while typing a name", () => {
  const borrowers = deriveBorrowers(
    [
      makeLoan({ id: "1", borrower: { ...thandi, name: "Thandi Nkosi" } }),
      makeLoan({ id: "2", borrower: { ...thandi, name: "Sipho Thando", cellphone: "0731234567" } }),
      makeLoan({ id: "3", borrower: { ...thandi, name: "Ayanda Mokoena", cellphone: "0841234567" } }),
    ],
    today,
  )

  it("puts names that start with the text first", () => {
    expect(suggestBorrowers(borrowers, "than").map((borrower) => borrower.details.name)).toEqual(["Thandi Nkosi", "Sipho Thando"])
  })

  it("suggests nothing for an empty box", () => {
    expect(suggestBorrowers(borrowers, " ")).toEqual([])
  })

  it("stops suggesting once the full name is typed", () => {
    expect(suggestBorrowers(borrowers, "Ayanda Mokoena")).toEqual([])
  })
})
