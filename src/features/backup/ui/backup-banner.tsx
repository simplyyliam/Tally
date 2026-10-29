import { CloudAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useLoans } from "@/features/loans"
import { todayIso } from "@/shared/lib/dates"
import { isBackupDue } from "../domain/backup-file"
import { useLastBackupAt } from "../data/backup-context"
import { useDownloadBackup } from "./use-download-backup"

/** A gentle nudge across the top when there's real data and no backup in 7 days. */
export function BackupBanner() {
  const { data: loans } = useLoans()
  const { lastBackupAt, loading } = useLastBackupAt()
  const downloadBackup = useDownloadBackup()
  const hasRealData = (loans ?? []).some((loan) => !loan.isDemo)

  if (loading || !loans || !isBackupDue(lastBackupAt, hasRealData, todayIso())) return null

  return (
    <Alert className="flex items-center gap-3 rounded-none border-x-0 border-t-0 border-amber-text/15 bg-amber-tint px-4 py-2 text-amber-text md:px-6">
      <CloudAlert />
      <AlertDescription className="flex-1 text-amber-text">
        {lastBackupAt ? "It's been over a week since your last backup." : "You haven't made a backup yet."} Your loans live only in this browser.
      </AlertDescription>
      <Button size="sm" variant="outline" className="shrink-0 border-amber-text/25 bg-transparent text-amber-text hover:bg-amber-text/10" onClick={() => void downloadBackup()}>
        Download backup
      </Button>
    </Alert>
  )
}
