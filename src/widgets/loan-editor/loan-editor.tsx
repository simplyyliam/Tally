import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CircleCheck } from "lucide-react"
import {
  LoanForm,
  draftFromLoan,
  editLoan,
  useLoanEditor,
  useLoanRepository,
  useLoans,
  type BorrowerDetails,
  type Loan,
  type LoanDraft,
} from "@/features/loans"
import { useSettings } from "@/features/settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/shared/ui/button"
import { Dialog } from "@/shared/ui/dialog"
import { useToast } from "@/shared/ui/toast"
import { addDays, nowTimestamp, todayIso } from "@/shared/lib/dates"
import { createId } from "@/shared/lib/ids"

const FORM_ID = "loan-form"

/**
 * The New loan / Edit loan dialog, drawn once for the whole app. After a new
 * loan is saved the form clears and stays open, ready for the next borrower.
 */
export function LoanEditor() {
  const { state, close } = useLoanEditor()
  const { data: loans = [] } = useLoans()
  const repository = useLoanRepository()
  const settings = useSettings()
  const toast = useToast()
  // Bumping this remounts the form with fresh, empty fields.
  const [formKey, setFormKey] = useState(0)
  const [lastSaved, setLastSaved] = useState<Loan | null>(null)

  const editing = state.mode === "edit" ? loans.find((loan) => loan.id === state.loanId) : undefined
  const open = state.mode === "new" || (state.mode === "edit" && editing !== undefined)

  const initial: LoanDraft = editing
    ? draftFromLoan(editing)
    : emptyDraft(settings.staffName, state.mode === "new" ? state.borrower : undefined)

  const handleSubmit = async (draft: LoanDraft) => {
    try {
      if (editing) {
        await repository.save(editLoan(editing, draft, { at: nowTimestamp(), createId }))
        toast("Changes saved")
        close()
        return
      }
      const created = await repository.create(draft)
      setLastSaved(created)
      setFormKey((key) => key + 1)
    } catch (error) {
      toast(error instanceof Error ? error.message : "Couldn't save the loan", { tone: "error" })
    }
  }

  const handleClose = () => {
    close()
    setLastSaved(null)
    setFormKey((key) => key + 1)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title={editing ? "Edit loan" : "New loan"}
      description={editing ? editing.borrower.name : "Fill in who is borrowing what, then press Enter to save."}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {lastSaved && !editing ? "Done" : "Cancel"}
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID}>
            {editing ? "Save changes" : "Save loan"}
          </Button>
        </>
      }
    >
      <AnimatePresence>
        {lastSaved && !editing && (
          <motion.div
            key={lastSaved.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Alert role="status" className="mb-6 rounded-lg border-green-text/15 bg-green-tint text-green-text">
              <CircleCheck />
              <AlertDescription className="text-[13px] text-green-text">
                Saved for <strong className="font-semibold">{lastSaved.borrower.name}</strong>. Ready for the next borrower.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <LoanForm
          key={editing ? editing.id : formKey}
          formId={FORM_ID}
          initial={initial}
          onSubmit={handleSubmit}
        />
      )}
    </Dialog>
  )
}

function emptyDraft(staffName: string, borrower?: BorrowerDetails): LoanDraft {
  const today = todayIso()
  return {
    borrower: borrower ?? { name: "", cellphone: "", whatsapp: "", department: "", employeeNumber: "" },
    lines: [{ description: "", quantity: 1 }],
    startDate: today,
    expectedReturnDate: addDays(today, 7),
    issuedBy: staffName,
    notes: "",
    isDemo: false,
  }
}
