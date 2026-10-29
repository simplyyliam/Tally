import { toast } from "sonner"
import { downloadTextFile } from "@/shared/lib/download"
import { backupFileName } from "../domain/backup-file"
import { useBackupRepository } from "../data/backup-context"

/** Creates a backup and saves it to the downloads folder. */
export function useDownloadBackup(): () => Promise<void> {
  const repository = useBackupRepository()
  return async () => {
    try {
      const backup = await repository.createBackup()
      downloadTextFile(backupFileName(backup.exportedAt), JSON.stringify(backup, null, 2), "application/json")
      toast.success("Backup downloaded. Keep it somewhere safe, like email or a USB stick.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create the backup")
    }
  }
}
