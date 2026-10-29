import { describe, expect, it } from "vitest"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { makeLoan } from "../domain/test-loans"
import { LocalLoanRepository } from "./local-loan-repository"

const draft = {
  borrower: { name: "Sipho", cellphone: "", whatsapp: "", department: "", employeeNumber: "" },
  lines: [{ description: "Drill", quantity: 1 }],
  startDate: "2026-10-29",
  expectedReturnDate: "2026-11-05",
  issuedBy: "",
  notes: "",
  isDemo: false,
}

function setup(initial: Record<string, string> = {}) {
  const storage = createMemoryStorage(initial)
  const store = new LocalDocumentStore(storage)
  return { storage, store, repository: new LocalLoanRepository(store, () => "2026-10-29T10:00:00.000Z") }
}

describe("local loan repository", () => {
  it("saves a new loan and reads it back", async () => {
    const { repository } = setup()
    const created = await repository.create(draft)
    expect(await repository.list()).toEqual([created])
  })

  it("survives a page reload because it writes to browser storage", async () => {
    const { storage, repository } = setup()
    await repository.create(draft)
    const reloaded = new LocalLoanRepository(new LocalDocumentStore(storage))
    expect(await reloaded.list()).toHaveLength(1)
  })

  it("puts a damaged record in quarantine instead of deleting it", async () => {
    const good = makeLoan({ id: "good" })
    const { store, repository } = setup({
      "tally.register": JSON.stringify({ loans: [good, { id: "broken" }] }),
    })
    expect((await repository.list()).map((loan) => loan.id)).toEqual(["good"])
    expect(store.getSection("quarantine")).toEqual([expect.objectContaining({ record: { id: "broken" } })])
  })

  it("can put deleted loans back (Undo)", async () => {
    const { repository } = setup()
    const created = await repository.create(draft)
    await repository.remove([created.id])
    await repository.saveMany([created])
    expect(await repository.list()).toEqual([created])
  })

  it("tells subscribers when something changed", async () => {
    const { repository } = setup()
    let calls = 0
    repository.subscribe(() => calls++)
    await repository.create(draft)
    expect(calls).toBe(1)
  })
})
