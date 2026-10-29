import { describe, expect, it } from "vitest"
import { LocalDocumentStore, StorageWriteError, createMemoryStorage } from "./local-document"
import { CURRENT_SCHEMA_VERSION, prepareStoredDocument } from "./migrations"
import { legacyDate } from "./legacy-loan"

/** What the pre-v1.0 downloadable register saved: one flat row per item. */
const preV1Loans = [
  {
    id: "old-1",
    borrowerName: "Thandi Nkosi",
    cellphone: "082 123 4567",
    itemDescription: "Extension cord",
    quantity: 3,
    startDate: "2026-09-01",
    expectedReturnDate: "2026-09-08",
    department: "Maintenance",
    employeeNumber: "E1042",
    issuedBy: "Dad",
    notes: "Grey ones",
    returned: false,
    extended: true,
    originalReturnDate: "2026-09-05",
  },
  {
    id: "old-2",
    borrowerName: "Sipho Dlamini",
    phone: "0731234567",
    item: "Projector",
    qty: "1",
    loanDate: "02/09/2026",
    dueDate: "09/09/2026",
    status: "Returned",
    dateReturned: "2026-09-07",
  },
]

describe("loading pre-v1.0 data", () => {
  it("upgrades every flat legacy loan into a loan with one line item", () => {
    const storage = createMemoryStorage({ "tally-loans": JSON.stringify(preV1Loans) })
    const store = new LocalDocumentStore(storage)
    const loans = store.getSection("loans") as Array<Record<string, any>>

    expect(loans).toHaveLength(2)
    expect(loans[0]).toMatchObject({
      id: "old-1",
      borrower: { name: "Thandi Nkosi", cellphone: "082 123 4567", department: "Maintenance", employeeNumber: "E1042" },
      lines: [{ description: "Extension cord", quantity: 3, quantityReturned: 0 }],
      startDate: "2026-09-01",
      expectedReturnDate: "2026-09-08",
      originalReturnDate: "2026-09-05",
      issuedBy: "Dad",
      notes: "Grey ones",
    })
  })

  it("understands the other field names and day-first dates older builds used", () => {
    const storage = createMemoryStorage({ "tally-loans": JSON.stringify(preV1Loans) })
    const loans = new LocalDocumentStore(storage).getSection("loans") as Array<Record<string, any>>
    expect(loans[1]).toMatchObject({
      borrower: { name: "Sipho Dlamini", cellphone: "0731234567" },
      lines: [{ description: "Projector", quantity: 1, quantityReturned: 1 }],
      startDate: "2026-09-02",
      expectedReturnDate: "2026-09-09",
    })
    expect(loans[1].returnedAt).toMatch(/^2026-09-07/)
  })

  it("saves the upgraded register and leaves the legacy key untouched as a safety copy", () => {
    const storage = createMemoryStorage({ "tally-loans": JSON.stringify(preV1Loans) })
    new LocalDocumentStore(storage).read()
    const saved = JSON.parse(storage.dump()["tally.register"])
    expect(saved.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(saved.loans).toHaveLength(2)
    expect(storage.dump()["tally-loans"]).toBe(JSON.stringify(preV1Loans))
  })

  it("upgrades a register document saved without a schemaVersion and keeps the original text", () => {
    const original = JSON.stringify({ loans: preV1Loans, settings: { staffName: "Dad" } })
    const storage = createMemoryStorage({ "tally.register": original })
    const store = new LocalDocumentStore(storage)
    expect(store.migratedFrom).toBe(0)
    expect(store.getSection("settings")).toEqual({ staffName: "Dad" })
    expect(storage.dump()["tally.register.before-v1"]).toBe(original)
  })

  it("numbers legacy loans oldest first and remembers the last number used", () => {
    const storage = createMemoryStorage({ "tally-loans": JSON.stringify(preV1Loans) })
    const store = new LocalDocumentStore(storage)
    const loans = store.getSection("loans") as Array<Record<string, any>>
    expect(loans.map((loan) => loan.reference)).toEqual(["LN-2026-0001", "LN-2026-0002"])
    expect(store.getSection("loanReferenceCounters")).toEqual({ "2026": 2 })
    expect(loans[0].issuedAt).toBe(loans[0].createdAt)
    expect(loans[0].extendedAt).toEqual([])
  })

  it("never drops a record it can't understand", () => {
    const { document } = prepareStoredDocument({ loans: ["garbage", 42] }, createMemoryStorage())
    expect(document.loans).toEqual(["garbage", 42])
  })
})

describe("current and future versions", () => {
  it("leaves current data exactly as it is", () => {
    const current = { schemaVersion: CURRENT_SCHEMA_VERSION, loans: [], settings: { staffName: "Liam" } }
    const prepared = prepareStoredDocument(current, createMemoryStorage())
    expect(prepared.migratedFrom).toBeNull()
    expect(prepared.document).toBe(current)
  })

  it("refuses to overwrite data saved by a newer version of the app", () => {
    const storage = createMemoryStorage({ "tally.register": JSON.stringify({ schemaVersion: 99, loans: [] }) })
    const store = new LocalDocumentStore(storage)
    expect(store.readOnlyReason).toMatch(/newer version/)
    expect(() => store.setSection("loans", [])).toThrow(StorageWriteError)
  })

  it("keeps unreadable storage text instead of overwriting it", () => {
    const storage = createMemoryStorage({ "tally.register": "{not json" })
    new LocalDocumentStore(storage).read()
    const kept = Object.entries(storage.dump()).find(([key]) => key.startsWith("tally.register.unreadable"))
    expect(kept?.[1]).toBe("{not json")
  })
})

describe("legacy dates", () => {
  it("reads ISO, timestamp and day-first dates", () => {
    expect(legacyDate("2026-10-29")).toBe("2026-10-29")
    expect(legacyDate("2026-10-29T08:00:00Z")).toBe("2026-10-29")
    expect(legacyDate("29/10/2026")).toBe("2026-10-29")
    expect(legacyDate("")).toBeUndefined()
  })
})
