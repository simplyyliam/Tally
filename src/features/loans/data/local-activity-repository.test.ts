import { describe, expect, it } from "vitest"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { activityFor } from "../domain/activity"
import { makeLoan } from "../domain/test-loans"
import { LocalActivityRepository } from "./local-activity-repository"

const AT = "2026-11-02T08:00:00.000Z"

describe("the local activity log", () => {
  it("records entries with a timestamp and keeps them in the register document", async () => {
    const store = new LocalDocumentStore(createMemoryStorage())
    const activity = new LocalActivityRepository(store, () => AT)
    await activity.record([activityFor(makeLoan(), "create", "Liam", "1 item: 1 × Extension cord")])
    const [entry] = await activity.list()
    expect(entry).toMatchObject({ at: AT, kind: "create", staffName: "Liam", reference: "LN-2026-0001" })
    expect(store.getSection("activity")).toHaveLength(1)
  })

  it("removes the history of purged loans only", async () => {
    const activity = new LocalActivityRepository(new LocalDocumentStore(createMemoryStorage()), () => AT)
    await activity.record([
      activityFor(makeLoan({ id: "old" }), "return", "", ""),
      activityFor(makeLoan({ id: "keep" }), "create", "", ""),
    ])
    await activity.removeForLoans(["old"])
    expect((await activity.list()).map((entry) => entry.loanId)).toEqual(["keep"])
  })

  it("an unreadable entry is hidden from the list but never deleted", async () => {
    const store = new LocalDocumentStore(createMemoryStorage())
    store.setSection("activity", [{ broken: true }])
    const activity = new LocalActivityRepository(store, () => AT)
    await activity.record([activityFor(makeLoan(), "edit", "", "")])
    expect(await activity.list()).toHaveLength(1)
    expect(store.getSection("activity")).toHaveLength(2)
  })
})
