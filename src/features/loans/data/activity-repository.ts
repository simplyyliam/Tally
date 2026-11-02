import type { ActivityDraft, ActivityEntry } from "../domain/activity"

/** The activity log's storage. Like loans, screens only see this interface. */
export interface ActivityRepository {
  list(): Promise<ActivityEntry[]>
  record(entries: ReadonlyArray<ActivityDraft>): Promise<void>
  /** Removes the history of loans that are being purged (data retention). */
  removeForLoans(loanIds: ReadonlyArray<string>): Promise<void>
  subscribe(onChange: () => void): () => void
}
