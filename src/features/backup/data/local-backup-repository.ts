import { nowTimestamp, todayIso } from "@/shared/lib/dates"
import { createMemoryStorage, isRecord, type KeyValueStorage, type LocalDocumentStore } from "@/shared/schema/local-document"
import { prepareStoredDocument } from "@/shared/schema/migrations"
import { BackupFileError, buildBackup, readBackupEnvelope, summariseBackup, type BackupEnvelope } from "../domain/backup-file"
import type { BackupRepository, PreparedRestore } from "./backup-repository"

const META = "meta"
export const SAFETY_COPY_KEY = "tally.register.before-restore"

export class LocalBackupRepository implements BackupRepository {
  private readonly store: LocalDocumentStore
  private readonly storage: KeyValueStorage
  private readonly clock: () => string

  constructor(store: LocalDocumentStore, storage: KeyValueStorage, clock: () => string = () => nowTimestamp()) {
    this.store = store
    this.storage = storage
    this.clock = clock
  }

  async createBackup(): Promise<BackupEnvelope> {
    const exportedAt = this.clock()
    const meta = this.meta()
    // Record the backup first so the file itself shows when it was made.
    this.store.setSection(META, { ...meta, lastBackupAt: exportedAt })
    return buildBackup(this.store.read(), exportedAt)
  }

  async prepareRestore(fileText: string): Promise<PreparedRestore> {
    const envelope = readBackupEnvelope(fileText)
    // Upgrade older backups with the same migrations used on load; a scratch storage keeps this side-effect free.
    const prepared = prepareStoredDocument(envelope.data, createMemoryStorage())
    if (prepared.readOnlyReason) throw new BackupFileError(prepared.readOnlyReason)
    return { document: prepared.document, summary: summariseBackup(prepared.document, envelope.exportedAt, todayIso()) }
  }

  async restore(prepared: PreparedRestore): Promise<void> {
    this.storage.setItem(SAFETY_COPY_KEY, JSON.stringify(this.store.read()))
    const restoredMeta = isRecord(prepared.document[META]) ? prepared.document[META] : {}
    // Restoring from a backup means a backup exists as of now.
    this.store.replace({ ...prepared.document, [META]: { ...restoredMeta, lastBackupAt: this.clock() } })
  }

  async lastBackupAt(): Promise<string | undefined> {
    const value = this.meta().lastBackupAt
    return typeof value === "string" ? value : undefined
  }

  subscribe(onChange: () => void): () => void {
    return this.store.subscribe(onChange)
  }

  private meta(): Record<string, unknown> {
    const meta = this.store.getSection(META)
    return isRecord(meta) ? meta : {}
  }
}
