import { describe, expect, it } from "vitest"
import { LocalLoanRepository, loanStatus } from "@/features/loans"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { buildImport } from "../domain/build-import"
import { guessMapping } from "../domain/import-fields"
import { saveImport } from "./save-import"

const IMPORTED_AT = "2026-11-02T09:00:00.000Z"

describe("saving an import", () => {
  it("imports rows as normal loans with new references, back-dated and returned where the sheet says so", async () => {
    const repository = new LocalLoanRepository(new LocalDocumentStore(createMemoryStorage()), () => IMPORTED_AT)
    const { loans } = buildImport(
      [
        ["Thandi", "Drill", "28/10/2026", "04/11/2026", ""],
        ["Sipho", "Ladder", "01/10/2026", "08/10/2026", "09/10/2026"],
      ],
      guessMapping(["Name", "Item", "Date out", "Due date", "Returned"]),
      "2026-11-02",
    )
    const saved = await saveImport(repository, loans, IMPORTED_AT)
    const stored = await repository.list()

    expect(stored.map((loan) => loan.reference)).toEqual(["LN-2026-0001", "LN-2026-0002"])
    expect(saved[0].issuedAt).toBe("2026-10-28T10:00:00.000Z")
    expect(saved[0].createdAt).toBe(IMPORTED_AT)
    expect(loanStatus(stored[0], "2026-11-02")).toBe("on-loan")
    expect(loanStatus(stored[1], "2026-11-02")).toBe("returned")
    expect(stored[1].returnedAt).toBe("2026-10-09T10:00:00.000Z")
  })
})
