import { describe, expect, it } from "vitest"
import { activityFor, describeIssue, describeReturn, sortActivity, type ActivityEntry } from "./activity"
import { returnAllItems, returnLines } from "./changes"
import { makeLine, makeLoan } from "./test-loans"

const AT = "2026-11-02T08:00:00.000Z"
const loan = makeLoan({
  lines: [makeLine({ id: "a", description: "Drill", quantity: 2 }), makeLine({ id: "b", description: "Ladder", quantity: 1 })],
})

describe("activity log wording", () => {
  it("an issue lists every item with its quantity", () => {
    expect(describeIssue(loan)).toBe("3 items: 2 × Drill, 1 × Ladder")
  })

  it("a partial return says what came back and what is still out", () => {
    expect(describeReturn(loan, returnLines(loan, { a: 1 }, AT))).toEqual({ kind: "partial-return", detail: "1 × Drill back · 2 items still out" })
  })

  it("returning the rest counts as a full return", () => {
    const partly = returnLines(loan, { a: 2 }, AT)
    expect(describeReturn(partly, returnAllItems(partly, AT))).toEqual({ kind: "return", detail: "Everything back: 1 × Ladder" })
  })

  it("an entry keeps the reference and borrower name, so a deleted loan's history still reads", () => {
    expect(activityFor(loan, "delete", "Liam", "gone")).toEqual({
      kind: "delete",
      loanId: "loan-1",
      reference: "LN-2026-0001",
      borrowerName: "Thandi Nkosi",
      staffName: "Liam",
      detail: "gone",
    })
  })

  it("sorts newest first and can show one loan only", () => {
    const entry = (id: string, loanId: string, at: string): ActivityEntry => ({ ...activityFor(loan, "edit", "", ""), id, loanId, at })
    const entries = [entry("1", "a", "2026-11-01T08:00:00Z"), entry("2", "b", "2026-11-02T08:00:00Z"), entry("3", "a", "2026-11-03T08:00:00Z")]
    expect(sortActivity(entries).map((item) => item.id)).toEqual(["3", "2", "1"])
    expect(sortActivity(entries, "a").map((item) => item.id)).toEqual(["3", "1"])
  })
})
