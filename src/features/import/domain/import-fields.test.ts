import { describe, expect, it } from "vitest"
import { EXPORT_HEADERS } from "@/features/loans"
import { guessMapping, missingRequiredFields } from "./import-fields"

describe("guessing the column mapping", () => {
  it("maps a typical register's headers", () => {
    const mapping = guessMapping(["Name", "Cell", "Department", "Item", "Qty", "Date out", "Due date", "Notes"])
    expect(mapping).toMatchObject({
      borrowerName: 0,
      cellphone: 1,
      department: 2,
      item: 3,
      quantity: 4,
      startDate: 5,
      expectedReturnDate: 6,
      notes: 7,
      whatsapp: null,
    })
  })

  it("maps Tally's own CSV export back onto the same fields", () => {
    const mapping = guessMapping(EXPORT_HEADERS)
    const column = (header: (typeof EXPORT_HEADERS)[number]) => EXPORT_HEADERS.indexOf(header)
    expect(mapping).toMatchObject({
      reference: column("Reference"),
      borrowerName: column("Borrower"),
      cellphone: column("Cellphone"),
      whatsapp: column("WhatsApp"),
      employeeNumber: column("Employee number"),
      item: column("Item"),
      quantity: column("Quantity"),
      startDate: column("Start date"),
      expectedReturnDate: column("Expected return date"),
      issuedBy: column("Issued by"),
      notes: column("Notes"),
      returned: column("Status"),
    })
  })

  it("never uses one column for two fields", () => {
    const mapping = guessMapping(["Return date"])
    expect(mapping.expectedReturnDate).toBe(0)
    expect(mapping.startDate).toBeNull()
  })

  it("an item column called 'Item name' is the item, not the borrower", () => {
    expect(guessMapping(["Borrower name", "Item name"])).toMatchObject({ borrowerName: 0, item: 1 })
  })

  it("lists required fields that still need a column", () => {
    expect(missingRequiredFields(guessMapping(["Name", "Item"]))).toEqual(["Return date"])
  })
})
