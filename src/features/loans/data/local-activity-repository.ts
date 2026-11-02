import { createId } from "@/shared/lib/ids"
import { nowTimestamp } from "@/shared/lib/dates"
import { isRecord, type LocalDocumentStore } from "@/shared/schema/local-document"
import { activityEntrySchema, type ActivityDraft, type ActivityEntry } from "../domain/activity"
import type { ActivityRepository } from "./activity-repository"

const SECTION = "activity"

export class LocalActivityRepository implements ActivityRepository {
  private readonly store: LocalDocumentStore
  private readonly clock: () => string

  constructor(store: LocalDocumentStore, clock: () => string = () => nowTimestamp()) {
    this.store = store
    this.clock = clock
  }

  async list(): Promise<ActivityEntry[]> {
    return this.readAll()
  }

  async record(drafts: ReadonlyArray<ActivityDraft>): Promise<void> {
    if (drafts.length === 0) return
    const at = this.clock()
    const entries = drafts.map((draft) => activityEntrySchema.parse({ ...draft, id: createId(), at }))
    this.store.setSection(SECTION, [...this.readRaw(), ...entries])
  }

  async removeForLoans(loanIds: ReadonlyArray<string>): Promise<void> {
    const removing = new Set(loanIds)
    this.store.setSection(
      SECTION,
      this.readRaw().filter((entry) => !(isRecord(entry) && typeof entry.loanId === "string" && removing.has(entry.loanId))),
    )
  }

  subscribe(onChange: () => void): () => void {
    return this.store.subscribe(onChange)
  }

  /** Unreadable entries are skipped when shown but kept in storage, so nothing is lost. */
  private readAll(): ActivityEntry[] {
    return this.readRaw().flatMap((record) => {
      const result = activityEntrySchema.safeParse(record)
      return result.success ? [result.data] : []
    })
  }

  private readRaw(): unknown[] {
    const raw = this.store.getSection(SECTION)
    return Array.isArray(raw) ? raw : []
  }
}
