import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSettings } from "@/features/settings"
import { nowTimestamp } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import { activityFor, describeExtension, describeIssue, describeReturn } from "../domain/activity"
import { extendLoan, returnAllItems, returnLines } from "../domain/changes"
import type { Loan } from "../domain/loan"
import { isFullyReturned, outstandingQuantity } from "../domain/status"
import { useActivityRepository } from "../data/activity-context"
import { useLoanRepository } from "../data/loan-repository-context"
import { ExtendDialog } from "./extend-dialog"
import { ReturnDialog } from "./return-dialog"

interface LoanActions {
  /** Marks every item on these loans as back. One tap, with Undo. */
  returnLoans: (loans: ReadonlyArray<Loan>) => Promise<void>
  /** The Return button: one tap for a single item, otherwise a dialog to pick what came back. */
  requestReturn: (loan: Loan) => void
  requestExtend: (loan: Loan) => void
  requestDelete: (loans: ReadonlyArray<Loan>, onDeleted?: () => void) => void
}

const LoanActionsContext = createContext<LoanActions | null>(null)

/**
 * Return, extend and delete in one place, so every screen behaves the same
 * and shows the same confirmations. Status changes at the handover, so
 * returning never asks "are you sure?": it offers Undo instead. Every change,
 * Undo included, is written to the activity log with the staff name.
 */
export function LoanActionsProvider({ children }: { children: ReactNode }) {
  const repository = useLoanRepository()
  const activity = useActivityRepository()
  const { staffName } = useSettings()
  const [extending, setExtending] = useState<Loan | null>(null)
  const [returning, setReturning] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState<{ loans: ReadonlyArray<Loan>; onDeleted?: () => void } | null>(null)

  const guard = async (work: () => Promise<void>) => {
    try {
      await work()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  /** Undo: puts the earlier versions back and says so in the log. */
  const restore = async (loans: ReadonlyArray<Loan>, detail: string) => {
    await repository.saveMany(loans)
    await activity.record(loans.map((loan) => activityFor(loan, "undo", staffName, detail)))
  }

  const actions: LoanActions = {
    returnLoans: (loans) =>
      guard(async () => {
        const open = loans.filter((loan) => !isFullyReturned(loan))
        if (open.length === 0) return
        const at = nowTimestamp()
        const returned = open.map((loan) => returnAllItems(loan, at))
        await repository.saveMany(returned)
        await activity.record(returned.map((loan, index) => activityFor(loan, "return", staffName, describeReturn(open[index], loan).detail)))
        toast.success(open.length === 1 ? `${open[0].reference} returned by ${open[0].borrower.name}` : `${plural(open.length, "loan")} marked returned`, {
          action: { label: "Undo", onClick: () => void guard(() => restore(open, "Return undone")) },
        })
      }),
    requestReturn: (loan) => {
      if (outstandingQuantity(loan) <= 1) void actions.returnLoans([loan])
      else setReturning(loan)
    },
    requestExtend: setExtending,
    requestDelete: (loans, onDeleted) => setDeleting({ loans, onDeleted }),
  }

  return (
    <LoanActionsContext.Provider value={actions}>
      {children}
      <ReturnDialog
        loan={returning}
        onClose={() => setReturning(null)}
        onReturn={(loan, counts) =>
          guard(async () => {
            const updated = returnLines(loan, counts, nowTimestamp())
            await repository.save(updated)
            const change = describeReturn(loan, updated)
            await activity.record([activityFor(updated, change.kind, staffName, change.detail)])
            setReturning(null)
            const left = outstandingQuantity(updated)
            toast.success(left === 0 ? `${loan.reference} fully returned` : `Partly returned · ${plural(left, "item")} still out`, {
              action: { label: "Undo", onClick: () => void guard(() => restore([loan], "Return undone")) },
            })
          })
        }
      />
      <ExtendDialog
        loan={extending}
        onClose={() => setExtending(null)}
        onExtend={(loan, date) =>
          guard(async () => {
            const extended = extendLoan(loan, date, nowTimestamp())
            await repository.save(extended)
            await activity.record([activityFor(extended, "extend", staffName, describeExtension(extended))])
            setExtending(null)
            toast.success("Return date extended")
          })
        }
      />
      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleting && deleting.loans.length > 1 ? `Delete ${deleting.loans.length} loans?` : "Delete this loan?"}</AlertDialogTitle>
            <AlertDialogDescription>
              The record is removed from this register. Use this for mistakes; returned loans should be marked returned instead so the
              history is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const target = deleting
                setDeleting(null)
                if (!target) return
                void guard(async () => {
                  await repository.remove(target.loans.map((loan) => loan.id))
                  await activity.record(target.loans.map((loan) => activityFor(loan, "delete", staffName, describeIssue(loan))))
                  target.onDeleted?.()
                  toast.success(target.loans.length === 1 ? "Loan deleted" : `${plural(target.loans.length, "loan")} deleted`, {
                    action: { label: "Undo", onClick: () => void guard(() => restore(target.loans, "Delete undone")) },
                  })
                })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LoanActionsContext.Provider>
  )
}

export function useLoanActions(): LoanActions {
  const actions = useContext(LoanActionsContext)
  if (!actions) throw new Error("useLoanActions must be used inside LoanActionsProvider")
  return actions
}
