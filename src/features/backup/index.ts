// The public face of the backup feature. Other code imports only from here.
export {
  BACKUP_FORMAT,
  BackupFileError,
  backupFileName,
  buildBackup,
  isBackupDue,
  readBackupEnvelope,
  summariseBackup,
  type BackupEnvelope,
  type BackupSummary,
} from "./domain/backup-file"
export type { BackupRepository, PreparedRestore } from "./data/backup-repository"
export { LocalBackupRepository, SAFETY_COPY_KEY } from "./data/local-backup-repository"
export { BackupRepositoryProvider, useBackupRepository, useLastBackupAt } from "./data/backup-context"
export { BackupPanel } from "./ui/backup-panel"
export { BackupBanner } from "./ui/backup-banner"
export { useDownloadBackup } from "./ui/use-download-backup"
