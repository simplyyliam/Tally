import type { BackupEnvelope, BackupSummary } from "../domain/backup-file"

export interface PreparedRestore {
  /** The upgraded register, ready to swap in. */
  document: Record<string, unknown>
  summary: BackupSummary
}

/**
 * Backup and restore for the whole register. v1.0 works with files; v1.1
 * adds automatic cloud backups behind the same interface.
 */
export interface BackupRepository {
  createBackup(): Promise<BackupEnvelope>
  /** Checks and upgrades a backup file without changing anything yet. */
  prepareRestore(fileText: string): Promise<PreparedRestore>
  /** Replaces everything with the prepared document; the old data is kept as a safety copy. */
  restore(prepared: PreparedRestore): Promise<void>
  lastBackupAt(): Promise<string | undefined>
  subscribe(onChange: () => void): () => void
}
