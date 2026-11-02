import { describe, expect, it } from "vitest"
import { buildImport } from "./build-import"
import { guessMapping } from "./import-fields"

const TODAY = "2026-11-02"
const headers = ["Name", "Cell", "Item", "Qty", "Date out", "Due date", "Returned"]
const plan = (rows: string[][], columns = headers) => buildImport(rows, guessMapping(columns), TODAY)

describe("building loans from spreadsheet rows", () => {
  it("a complete row becomes one loan with one item", () => {
    const { loans, skipped } = plan([["Thandi Nkosi", "082 123 4567", "Drill", "2", "28/10/2026", "04/11/2026", ""]])
    expect(skipped).toEqual([])
    expect(loans).toHaveLength(1)
    expect(loans[0].draft).toMatchObject({
      borrower: { name: "Thandi Nkosi", cellphone: "082 123 4567" },
      lines: [{ description: "Drill", quantity: 2 }],
      startDate: "2026-10-28",
      expectedReturnDate: "2026-11-04",
    })
    expect(loans[0].returnedOn).toBeNull()
  })

  it("skips rows that can't be a loan and says why, with the spreadsheet row number", () => {
    const { loans, skipped } = plan([
      ["", "", "Drill", "1", "", "04/11/2026", ""],
      ["Sipho", "", "", "1", "", "31/02/2026", ""],
      ["Ayanda", "", "Ladder", "two", "05/11/2026", "01/11/2026", ""],
    ])
    expect(loans).toEqual([])
    expect(skipped).toEqual([
      { row: 2, reasons: ["No borrower name"] },
      { row: 3, reasons: ["No item", `Return date "31/02/2026" isn't a date`] },
      { row: 4, reasons: [`Quantity "two" isn't a whole number`, "Return date is before the start date"] },
    ])
  })

  it("keeps a loan with a bad phone number, moving the number into the notes", () => {
    const { loans, warnings } = plan([["Lerato", "12345", "Laptop", "", "", "10/11/2026", ""]])
    expect(loans[0].draft.borrower.cellphone).toBe("")
    expect(loans[0].draft.notes).toBe("Cellphone as imported: 12345")
    expect(warnings).toEqual([{ row: 2, message: `Cellphone "12345" doesn't look right, so it was put in the notes` }])
  })

  it("without a start date, a loan not yet due starts today and a past-due one starts on its due date", () => {
    const { loans } = plan([
      ["A", "", "Urn", "", "", "10/11/2026", ""],
      ["B", "", "Urn", "", "", "20/10/2026", ""],
    ])
    expect(loans.map((loan) => loan.draft.startDate)).toEqual([TODAY, "2026-10-20"])
  })

  it("reads the Returned column", () => {
    const { loans } = plan([
      ["A", "", "Urn", "", "", "20/10/2026", "25/10/2026"],
      ["B", "", "Urn", "", "", "20/10/2026", "yes"],
    ])
    expect(loans.map((loan) => loan.returnedOn)).toEqual(["2026-10-25", "unknown-date"])
  })

  it("rows with the same loan number become one loan with several items", () => {
    const columns = ["Reference", "Borrower", "Item", "Quantity", "Return date"]
    const { loans } = plan(
      [
        ["LN-2025-0009", "Johan", "Urn", "2", "2026-11-04"],
        ["LN-2025-0009", "Johan", "Chafing dish", "4", "2026-11-04"],
        ["LN-2025-0010", "Pieter", "Ladder", "1", "2026-11-05"],
      ],
      columns,
    )
    expect(loans).toHaveLength(2)
    expect(loans[0].rows).toEqual([2, 3])
    expect(loans[0].draft.lines).toEqual([
      { description: "Urn", quantity: 2 },
      { description: "Chafing dish", quantity: 4 },
    ])
  })

  it("ignores blank rows", () => {
    expect(plan([["", "", "", "", "", "", ""]])).toEqual({ loans: [], skipped: [], warnings: [] })
  })
})
