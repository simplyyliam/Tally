import { describe, expect, it } from "vitest"
import { LocalLoanRepository } from "@/features/loans"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { BackupFileError, isBackupDue } from "../domain/backup-file"
import { LocalBackupRepository, SAFETY_COPY_KEY } from "./local-backup-repository"

const draft = (name: string) => ({
  borrower: { name, cellphone: "", whatsapp: "", department: "", employeeNumber: "" },
  lines: [{ description: "Drill", quantity: 2 }],
  startDate: "2026-10-29",
  expectedReturnDate: "2026-11-05",
  issuedBy: "",
  notes: "",
  isDemo: false,
})

function device() {
  const storage = createMemoryStorage()
  const store = new LocalDocumentStore(storage)
  return {
    storage,
    loans: new LocalLoanRepository(store),
    backup: new LocalBackupRepository(store, storage, () => "2026-10-29T10:00:00.000Z"),
  }
}

describe("backup round-trip", () => {
  it("restoring a backup on another device brings everything back", async () => {
    const phone = device()
    await phone.loans.createMany([draft("Thandi"), draft("Sipho")])
    const file = JSON.stringify(await phone.backup.createBackup())

    const laptop = device()
    const prepared = await laptop.backup.prepareRestore(file)
    expect(prepared.summary).toMatchObject({ loanCount: 2, borrowerCount: 2, openLoanCount: 2, unreadableCount: 0 })
    await laptop.backup.restore(prepared)

    expect(await laptop.loans.list()).toEqual(await phone.loans.list())
  })

  it("keeps the reference counter, so new loans continue the numbering", async () => {
    const phone = device()
    await phone.loans.createMany([draft("A"), draft("B")])
    const laptop = device()
    await laptop.backup.restore(await laptop.backup.prepareRestore(JSON.stringify(await phone.backup.createBackup())))
    expect((await laptop.loans.create(draft("C"))).reference).toBe("LN-2026-0003")
  })

  it("keeps a safety copy of what was there before the restore", async () => {
    const target = device()
    await target.loans.create(draft("Existing"))
    const source = device()
    await target.backup.restore(await target.backup.prepareRestore(JSON.stringify(await source.backup.createBackup())))
    expect(JSON.parse(target.storage.dump()[SAFETY_COPY_KEY]).loans).toHaveLength(1)
  })

  it("records when the last backup was made", async () => {
    const phone = device()
    expect(await phone.backup.lastBackupAt()).toBeUndefined()
    await phone.backup.createBackup()
    expect(await phone.backup.lastBackupAt()).toBe("2026-10-29T10:00:00.000Z")
  })

  it("refuses a file that isn't a Tally backup, without changing anything", async () => {
    const phone = device()
    await expect(phone.backup.prepareRestore('{"hello":"world"}')).rejects.toThrow(BackupFileError)
    await expect(phone.backup.prepareRestore("not json")).rejects.toThrow(BackupFileError)
  })

  it("upgrades a backup of pre-v1.0 data while restoring", async () => {
    const old = JSON.stringify({
      app: "tally",
      kind: "backup",
      format: 1,
      exportedAt: "2026-09-01T08:00:00.000Z",
      data: { loans: [{ borrowerName: "Old Timer", itemDescription: "Ladder", startDate: "2026-08-01", expectedReturnDate: "2026-08-08" }] },
    })
    const phone = device()
    await phone.backup.restore(await phone.backup.prepareRestore(old))
    const [loan] = await phone.loans.list()
    expect(loan).toMatchObject({ reference: "LN-2026-0001", borrower: { name: "Old Timer" } })
  })
})

describe("backup reminder", () => {
  it("nudges when there is real data and no backup yet", () => {
    expect(isBackupDue(undefined, true, "2026-10-29")).toBe(true)
  })

  it("stays quiet for 7 days after a backup", () => {
    expect(isBackupDue("2026-10-23T10:00:00.000Z", true, "2026-10-29")).toBe(false)
    expect(isBackupDue("2026-10-22T10:00:00.000Z", true, "2026-10-29")).toBe(true)
  })

  it("stays quiet when there is only demo data", () => {
    expect(isBackupDue(undefined, false, "2026-10-29")).toBe(false)
  })
})
