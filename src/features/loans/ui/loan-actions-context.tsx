import { createContext, useContext, useState, type ReactNode } from "react"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { useToast } from "@/shared/ui/toast"
import { nowTimestamp } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import { extendLoan, returnAllItems } from "../domain/changes"
import type { Loan } from "../domain/loan"
import { isFullyReturned } from "../domain/status"
import { useLoanRepository } from "../data/loan-repository-context"
import { ExtendDialog } from "./extend-dialog"

interface LoanActions {
  /** Marks every item on these loans as back. One tap, with Undo. */
  returnLoans: (loans: ReadonlyArray<Loan>) => Promise<void>
  requestExtend: (loan: Loan) => void
  requestDelete: (loans: ReadonlyArray<Loan>, onDeleted?: () => void) => void
}

const LoanActionsContext = createContext<LoanActions | null>(null)

/**
 * Return, extend and delete in one place, so every screen behaves the same
 * and shows the same confirmations. Status changes at the handover, so
 * returning never asks "are you sure?": it offers Undo instead.
 */
export function LoanActionsProvider({ children }: { children: ReactNode }) {
  const repository = useLoanRepository()
  const toast = useToast()
  const [extending, setExtending] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState<{ loans: ReadonlyArray<Loan>; onDeleted?: () => void } | null>(null)

  const guard = async (work: () => Promise<void>) => {
    try {
      await work()
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", { tone: "error" })
    }
  }

  const actions: LoanActions = {
    returnLoans: (loans) =>
      guard(async () => {
        const open = loans.filter((loan) => !isFullyReturned(loan))
        if (open.length === 0) return
        const at = nowTimestamp()
        await repository.saveMany(open.map((loan) => returnAllItems(loan, at)))
        toast(open.length === 1 ? `${open[0].borrower.name}'s loan marked returned` : `${plural(open.length, "loan")} marked returned`, {
          action: { label: "Undo", onClick: () => void guard(() => repository.saveMany(open)) },
        })
      }),
    requestExtend: setExtending,
    requestDelete: (loans, onDeleted) => setDeleting({ loans, onDeleted }),
  }

  return (
    <LoanActionsContext.Provider value={actions}>
      {children}
      <ExtendDialog
        loan={extending}
        onClose={() => setExtending(null)}
        onExtend={(loan, date) =>
          guard(async () => {
            await repository.save(extendLoan(loan, date, nowTimestamp()))
            setExtending(null)
            toast("Return date extended")
          })
        }
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting && deleting.loans.length > 1 ? `Delete ${deleting.loans.length} loans?` : "Delete this loan?"}
        description="The record is removed from this register. Use this for mistakes; returned loans should be marked returned instead so the history is kept."
        confirmLabel="Delete"
        onConfirm={() => {
          const target = deleting
          if (!target) return
          void guard(async () => {
            await repository.remove(target.loans.map((loan) => loan.id))
            target.onDeleted?.()
            toast(target.loans.length === 1 ? "Loan deleted" : `${plural(target.loans.length, "loan")} deleted`, {
              action: { label: "Undo", onClick: () => void guard(() => repository.saveMany(target.loans)) },
            })
          })
        }}
      />
    </LoanActionsContext.Provider>
  )
}

export function useLoanActions(): LoanActions {
  const actions = useContext(LoanActionsContext)
  if (!actions) throw new Error("useLoanActions must be used inside LoanActionsProvider")
  return actions
}
