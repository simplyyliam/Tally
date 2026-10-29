import { describe, expect, it } from "vitest"
import { addDays, addMonths, daysBetween, formatDate, isIsoDate, todayIso } from "./dates"
import { formatPhone, isValidPhone, normalizePhone } from "./phone"
import { parseCsv, toCsv } from "./csv"

describe("dates", () => {
  it("today is worked out in Johannesburg, not the device's time zone", () => {
    // 23:30 UTC on 28 Oct is already 01:30 on 29 Oct in Johannesburg.
    expect(todayIso(new Date("2026-10-28T23:30:00Z"))).toBe("2026-10-29")
  })

  it("adds days across month and year ends", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02")
    expect(daysBetween("2026-10-27", "2026-10-29")).toBe(2)
  })

  it("adding a month to the 31st lands on the last day of a shorter month", () => {
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28")
  })

  it("rejects impossible dates", () => {
    expect(isIsoDate("2026-02-30")).toBe(false)
    expect(isIsoDate("2026-02-28")).toBe(true)
  })

  it("formats dates the South African way", () => {
    expect(formatDate("2026-10-29")).toBe("29 Oct 2026")
  })
})

describe("phone numbers", () => {
  it("normalises local and international South African numbers to the same digits", () => {
    expect(normalizePhone("082 123 4567")).toBe("27821234567")
    expect(normalizePhone("+27 82 123 4567")).toBe("27821234567")
    expect(normalizePhone("0027821234567")).toBe("27821234567")
  })

  it("rejects numbers that are too short", () => {
    expect(isValidPhone("12345")).toBe(false)
    expect(normalizePhone("")).toBeNull()
  })

  it("formats a number for display", () => {
    expect(formatPhone("27821234567")).toBe("082 123 4567")
  })
})

describe("CSV", () => {
  it("round-trips commas, quotes and line breaks", () => {
    const rows = [
      ["Name", "Notes"],
      ['Thandi "T" Nkosi', "Cord, grey\nchecked"],
    ]
    expect(parseCsv(toCsv(rows))).toEqual(rows)
  })

  it("reads semicolon-separated files from Excel", () => {
    expect(parseCsv("Name;Item\r\nSipho;Drill\r\n")).toEqual([
      ["Name", "Item"],
      ["Sipho", "Drill"],
    ])
  })

  it("skips blank lines", () => {
    expect(parseCsv("a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ])
  })
})
