import { describe, expect, it } from "vitest"
import { parseImportDate, parseQuantity, parseReturned } from "./import-values"

describe("reading dates from a spreadsheet", () => {
  it.each([
    ["2026-10-29", "2026-10-29"],
    ["2026-10-29T08:00:00Z", "2026-10-29"],
    ["29/10/2026", "2026-10-29"],
    ["3/11/2026", "2026-11-03"],
    ["29.10.2026", "2026-10-29"],
    ["29-10-26", "2026-10-29"],
    ["29 Oct 2026", "2026-10-29"],
    ["3 November 2026", "2026-11-03"],
    ["46324", "2026-10-29"],
  ])("reads %s as %s", (raw, expected) => {
    expect(parseImportDate(raw)).toBe(expected)
  })

  it("reads day-first, the South African way: 02/03/2026 is 2 March", () => {
    expect(parseImportDate("02/03/2026")).toBe("2026-03-02")
  })

  it.each(["31/02/2026", "13/13/2026", "tomorrow", "", "12", "2026-02-30"])("rejects %j", (raw) => {
    expect(parseImportDate(raw)).toBeNull()
  })
})

describe("reading quantities", () => {
  it("a blank quantity means 1", () => expect(parseQuantity("")).toBe(1))
  it("reads whole numbers", () => expect(parseQuantity(" 4 ")).toBe(4))
  it.each(["0", "-2", "1.5", "two"])("rejects %j", (raw) => expect(parseQuantity(raw)).toBeNull())
})

describe("reading the Returned column", () => {
  it.each(["", "No", "out", "On loan", "Overdue", "Due today"])("%j means still out", (raw) => {
    expect(parseReturned(raw)).toEqual({ returned: false })
  })
  it("a date means it came back that day", () => {
    expect(parseReturned("01/11/2026")).toEqual({ returned: true, on: "2026-11-01" })
  })
  it.each(["Yes", "Returned", "x"])("%j means it came back on an unknown date", (raw) => {
    expect(parseReturned(raw)).toEqual({ returned: true, on: null })
  })
})
