import { describe, expect, it } from "vitest"
import { loansToPurge, retentionCutoff } from "./retention"
import { makeLine, makeLoan } from "./test-loans"

const TODAY = "2026-11-02"
const returned = (id: string, returnedAt: string) =>
  makeLoan({ id, returnedAt, lines: [makeLine({ quantity: 1, quantityReturned: 1, returnedAt })] })

describe("data retention", () => {
  it("12 months before 2 Nov 2026 is 2 Nov 2025", () => {
    expect(retentionCutoff(12, TODAY)).toBe("2025-11-02")
  })

  it("finds loans returned before the cutoff and keeps newer ones", () => {
    const loans = [returned("old", "2025-10-31T10:00:00Z"), returned("recent", "2025-11-02T10:00:00Z")]
    expect(loansToPurge(loans, 12, TODAY).map((loan) => loan.id)).toEqual(["old"])
  })

  it("never purges a loan with an item still out, however old", () => {
    const stillOut = makeLoan({ id: "out", expectedReturnDate: "2020-01-10", updatedAt: "2020-01-01T08:00:00Z" })
    expect(loansToPurge([stillOut], 1, TODAY)).toEqual([])
  })

  it("does nothing for a nonsense number of months", () => {
    expect(loansToPurge([returned("old", "2020-01-01T10:00:00Z")], 0, TODAY)).toEqual([])
  })
})
