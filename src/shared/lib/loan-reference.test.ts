import { describe, expect, it } from "vitest"
import { allocateReferences, formatLoanReference, isLoanReference, parseLoanReference } from "./loan-reference"

describe("loan references", () => {
  it("formats the year and a four-digit number", () => {
    expect(formatLoanReference(2026, 1)).toBe("LN-2026-0001")
    expect(formatLoanReference(2026, 12345)).toBe("LN-2026-12345")
  })

  it("parses its own format and rejects others", () => {
    expect(parseLoanReference("LN-2026-0042")).toEqual({ year: 2026, sequence: 42 })
    expect(isLoanReference("LN-26-1")).toBe(false)
  })

  it("the first loan of a year is number 0001", () => {
    expect(allocateReferences(2026, 1, [], {}).references).toEqual(["LN-2026-0001"])
  })

  it("continues after the highest number already used that year", () => {
    const result = allocateReferences(2026, 2, ["LN-2026-0007", "LN-2025-0099"], {})
    expect(result.references).toEqual(["LN-2026-0008", "LN-2026-0009"])
    expect(result.counters).toEqual({ "2026": 9 })
  })

  it("never reuses the number of a deleted loan", () => {
    // LN-2026-0005 was deleted, but the counter remembers it was handed out.
    expect(allocateReferences(2026, 1, ["LN-2026-0004"], { "2026": 5 }).references).toEqual(["LN-2026-0006"])
  })

  it("starts again at 0001 in a new year", () => {
    expect(allocateReferences(2027, 1, ["LN-2026-0300"], { "2026": 300 }).references).toEqual(["LN-2027-0001"])
  })
})
