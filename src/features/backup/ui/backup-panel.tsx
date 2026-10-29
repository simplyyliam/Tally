import { useRef, useState } from "react"
import { Download, FileUp, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemGroup, ItemTitle, ItemActions } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { formatDateTime } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import { useBackupRepository, useLastBackupAt } from "../data/backup-context"
import type { PreparedRestore } from "../data/backup-repository"
import { useDownloadBackup } from "./use-download-backup"

/**
 * Download a backup file, or restore one. A restore is checked and summarised
 * first, and only replaces anything after an explicit confirmation.
 */
export function BackupPanel() {
  const repository = useBackupRepository()
  const { lastBackupAt } = useLastBackupAt()
  const downloadBackup = useDownloadBackup()
  const fileInput = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [pending, setPending] = useState<PreparedRestore | null>(null)

  const readFile = async (file: File) => {
    setReading(true)
    try {
      setPending(await repository.prepareRestore(await file.text()))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't read that file")
    } finally {
      setReading(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  return (
    <>
      <Card className="rounded-2xl shadow-none ring-border">
        <CardHeader>
          <CardTitle>Backup</CardTitle>
          <CardDescription>
            Everything is saved in this browser only. Clearing site data deletes it, so download a backup at least once a week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            {lastBackupAt ? `Last backup ${formatDateTime(lastBackupAt)}` : "No backup made yet"}
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => void downloadBackup()}>
            <Download data-icon="inline-start" />
            Download backup
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-none ring-border">
        <CardHeader>
          <CardTitle>Restore</CardTitle>
          <CardDescription>Bring back everything from a backup file, for example on a new computer or phone.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Backup file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void readFile(file)
            }}
          />
          <Button variant="outline" disabled={reading} onClick={() => fileInput.current?.click()}>
            {reading ? <Spinner data-icon="inline-start" /> : <FileUp data-icon="inline-start" />}
            {reading ? "Checking file…" : "Choose backup file"}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <FileUp />
            </AlertDialogMedia>
            <AlertDialogTitle>Replace everything with this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              The loans in this browser will be replaced. A safety copy of the current data is kept on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pending && (
            <ItemGroup className="gap-1">
              <SummaryRow label="Backup made" value={formatDateTime(pending.summary.exportedAt)} />
              <SummaryRow label="Loans" value={`${pending.summary.loanCount} (${pending.summary.openLoanCount} still out)`} />
              <SummaryRow label="Borrowers" value={String(pending.summary.borrowerCount)} />
              {pending.summary.unreadableCount > 0 && (
                <SummaryRow label="Unreadable records" value={`${plural(pending.summary.unreadableCount, "record")} kept aside, not lost`} />
              )}
            </ItemGroup>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pending) return
                try {
                  await repository.restore(pending)
                  toast.success(`Restored ${plural(pending.summary.loanCount, "loan")}`)
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Restore failed; nothing was changed")
                }
                setPending(null)
              }}
            >
              Replace and restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Item size="sm" variant="muted">
      <ItemContent>
        <ItemTitle className="font-normal text-muted-foreground">{label}</ItemTitle>
      </ItemContent>
      <ItemActions className="text-sm font-medium tabular">{value}</ItemActions>
    </Item>
  )
}
