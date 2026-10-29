import { LocalLoanRepository, type LoanRepository } from "@/features/loans"
import { LocalBackupRepository, type BackupRepository } from "@/features/backup"
import { LocalBorrowerRepository, type BorrowerRepository } from "@/features/borrowers"
import { LocalSettingsRepository, type SettingsRepository } from "@/features/settings"
import { WaMeChannel, type ReminderChannel } from "@/features/reminders"
import { LocalDocumentStore, STORAGE_KEY } from "@/shared/schema/local-document"

/**
 * THE place where storage is chosen. v1.0 keeps everything in this browser.
 * v1.1 swaps these for online (Supabase) implementations of the same
 * interfaces; no screen needs to change.
 */
export interface Repositories {
  loans: LoanRepository
  borrowers: BorrowerRepository
  backup: BackupRepository
  settings: SettingsRepository
  reminderChannel: ReminderChannel
  store: LocalDocumentStore
}

export function createRepositories(): Repositories {
  const store = new LocalDocumentStore(window.localStorage)

  // Another tab saved: re-read so this tab never overwrites newer data with stale data.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) store.reload()
  })

  return {
    store,
    loans: new LocalLoanRepository(store),
    borrowers: new LocalBorrowerRepository(store),
    backup: new LocalBackupRepository(store, window.localStorage),
    settings: new LocalSettingsRepository(store),
    reminderChannel: new WaMeChannel(),
  }
}
