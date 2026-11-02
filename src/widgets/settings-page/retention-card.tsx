import { useState } from "react"
import { Download, Trash2 } from "lucide-react"
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDownloadBackup } from "@/features/backup"
import { orphanedPreferenceKeys, useBorrowerRepository } from "@/features/borrowers"
import { loansToPurge, retentionCutoff, useActivityRepository, useLoanRepository, useLoans } from "@/features/loans"
import { formatDate, todayIso } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"

/**
 * "Delete returned loans older than N months". Loans with anything still out
 * are never touched. Their activity history and any borrower preferences left
 * without a loan go too, so no personal details linger.
 */
export function RetentionCard() {
  const { data: loans = [] } = useLoans()
  const loanRepository = useLoanRepository()
  const activityRepository = useActivityRepository()
  const borrowerRepository = useBorrowerRepository()
  const downloadBackup = useDownloadBackup()
  const [monthsText, setMonthsText] = useState("12")
  const [confirming, setConfirming] = useState(false)

  const months = Number(monthsText)
  const validMonths = Number.isInteger(months) && months >= 1 && months <= 120
  const today = todayIso()
  const purge = validMonths ? loansToPurge(loans, months, today) : []

  const deleteOld = async () => {
    try {
      const ids = purge.map((loan) => loan.id)
      const purging = new Set(ids)
      await loanRepository.remove(ids)
      await activityRepository.removeForLoans(ids)
      const remaining = loans.filter((loan) => !purging.has(loan.id))
      await borrowerRepository.removePreferences(orphanedPreferenceKeys(await borrowerRepository.listPreferences(), remaining))
      toast.success(`Deleted ${plural(ids.length, "returned loan")}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete the old loans")
    }
    setConfirming(false)
  }

  return (
    <Card className="rounded-2xl shadow-none ring-border">
      <CardHeader>
        <CardTitle>Data retention</CardTitle>
        <CardDescription>Remove borrowers' details once they're no longer needed. Only loans that are fully returned are deleted.</CardDescription>
      </CardHeader>
      <CardContent>
        <Field data-invalid={!validMonths || undefined}>
          <FieldLabel htmlFor="retention-months">Delete returned loans older than</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="retention-months"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={monthsText}
              aria-invalid={!validMonths || undefined}
              onChange={(event) => setMonthsText(event.target.value)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">months</span>
          </div>
          <FieldDescription>
            {validMonths
              ? `${plural(purge.length, "loan")} returned before ${formatDate(retentionCutoff(months, today))}`
              : "Enter a whole number of months from 1 to 120"}
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" className="hover:text-destructive" disabled={purge.length === 0} onClick={() => setConfirming(true)}>
          <Trash2 data-icon="inline-start" />
          Delete old loans
        </Button>
      </CardFooter>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete {plural(purge.length, "returned loan")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {plural(purge.length, "loan")} returned before {validMonths && formatDate(retentionCutoff(months, today))} will be deleted with their activity
              history. This can't be undone, so download a backup first if you might need them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" className="sm:mr-auto" onClick={() => void downloadBackup()}>
              <Download data-icon="inline-start" />
              Download backup
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void deleteOld()}>
              Delete {plural(purge.length, "loan")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
