import { describe, expect, it } from "vitest"
import { formatDate } from "@/shared/lib/dates"
import { makeLine, makeLoan } from "@/features/loans/domain/test-loans"
import { reminderTextForLoan } from "./loan-reminder"
import { DEFAULT_REMINDER_TEMPLATE, renderTemplate, unknownPlaceholders } from "./template"

const values = { name: "Thandi", items: "- 1 × Drill", dueDate: "3 Nov 2026", daysOverdue: "2", reference: "LN-2026-0007" }

describe("reminder templates", () => {
  it("fills every supported placeholder", () => {
    expect(renderTemplate("{name} {items} {dueDate} {daysOverdue} {reference}", values)).toBe("Thandi - 1 × Drill 3 Nov 2026 2 LN-2026-0007")
  })

  it("leaves a misspelt placeholder as typed so the preview shows the mistake", () => {
    expect(renderTemplate("Hi {nmae}", values)).toBe("Hi {nmae}")
  })

  it("lists each unknown placeholder once", () => {
    expect(unknownPlaceholders("{nmae} {name} {nmae} {due}")).toEqual(["nmae", "due"])
  })

  it("the default template uses only supported placeholders", () => {
    expect(unknownPlaceholders(DEFAULT_REMINDER_TEMPLATE)).toEqual([])
  })

  it("a custom template is filled from the loan, listing each item with its quantity", () => {
    const loan = makeLoan({
      reference: "LN-2026-0042",
      expectedReturnDate: "2026-10-27",
      lines: [makeLine({ id: "a", description: "Drill", quantity: 2 }), makeLine({ id: "b", description: "Ladder", quantity: 1 })],
    })
    expect(reminderTextForLoan(loan, "{reference} for {name}, {daysOverdue} days late:\n{items}", "2026-10-29")).toBe(
      "LN-2026-0042 for Thandi, 2 days late:\n- 2 × Drill\n- 1 × Ladder",
    )
  })

  it("a due-tomorrow reminder holds the reference, every item with its quantity, and the return date", () => {
    const loan = makeLoan({
      reference: "LN-2026-0013",
      expectedReturnDate: "2026-10-30",
      lines: [makeLine({ id: "a", description: "PA speaker", quantity: 2 }), makeLine({ id: "b", description: "Mic stand", quantity: 3 })],
    })
    const text = reminderTextForLoan(loan, DEFAULT_REMINDER_TEMPLATE, "2026-10-29")
    expect(text).toContain("LN-2026-0013")
    expect(text).toContain("- 2 × PA speaker")
    expect(text).toContain("- 3 × Mic stand")
    expect(text).toContain(formatDate("2026-10-30"))
  })
})
