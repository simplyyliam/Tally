import { describe, expect, it } from "vitest"
import { LocalBorrowerRepository } from "@/features/borrowers"
import { LocalActivityRepository, LocalLoanRepository, activityFor, loanStatus } from "@/features/loans"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { clearDemoData, loadDemoData } from "./demo-data"

const TODAY = "2026-11-02"
const AT = "2026-11-02T08:00:00.000Z"
const realDraft = {
  borrower: { name: "Real Person", cellphone: "", whatsapp: "", department: "", employeeNumber: "" },
  lines: [{ description: "Drill", quantity: 1 }],
  startDate: TODAY,
  expectedReturnDate: "2026-11-09",
  issuedBy: "",
  notes: "",
  isDemo: false,
}

function device() {
  const store = new LocalDocumentStore(createMemoryStorage())
  return {
    store,
    loans: new LocalLoanRepository(store, () => AT),
    activity: new LocalActivityRepository(store, () => AT),
    borrowers: new LocalBorrowerRepository(store),
  }
}

describe("demo data", () => {
  it("nothing is loaded until someone asks for it", async () => {
    expect(await device().loans.list()).toEqual([])
  })

  it("loads sample loans covering every status, all marked as demo", async () => {
    const { loans } = device()
    await loadDemoData(loans, TODAY, AT)
    const demo = await loans.list()
    expect(demo.every((loan) => loan.isDemo)).toBe(true)
    expect(new Set(demo.map((loan) => loanStatus(loan, TODAY)))).toEqual(new Set(["overdue", "due-today", "on-loan", "returned"]))
    expect(demo.some((loan) => loan.extendedAt.length > 0)).toBe(true)
    expect(demo.some((loan) => loan.lines.some((line) => line.quantityReturned > 0 && line.quantityReturned < line.quantity))).toBe(true)
  })

  it("demo loans don't use up real loan numbers", async () => {
    const { loans } = device()
    await loadDemoData(loans, TODAY, AT)
    const real = await loans.create(realDraft)
    expect(real.reference).toBe("LN-2026-0001")
  })

  it("clearing removes only demo loans, with their activity", async () => {
    const repositories = device()
    await loadDemoData(repositories.loans, TODAY, AT)
    const real = await repositories.loans.create(realDraft)
    const [firstDemo] = (await repositories.loans.list()).filter((loan) => loan.isDemo)
    await repositories.activity.record([activityFor(firstDemo, "return", "", ""), activityFor(real, "create", "", "")])

    await clearDemoData(repositories)

    expect((await repositories.loans.list()).map((loan) => loan.id)).toEqual([real.id])
    expect((await repositories.activity.list()).map((entry) => entry.loanId)).toEqual([real.id])
  })
})
