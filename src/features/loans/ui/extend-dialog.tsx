import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { addDays, formatDate, todayIso } from "@/shared/lib/dates"
import type { Loan } from "../domain/loan"

interface ExtendDialogProps {
  loan: Loan | null
  onClose: () => void
  onExtend: (loan: Loan, newReturnDate: string) => void
}

const QUICK_PICKS = [
  { label: "+1 day", days: 1 },
  { label: "+3 days", days: 3 },
  { label: "+1 week", days: 7 },
  { label: "+2 weeks", days: 14 },
]

/** Moves the expected return date. Quick picks count from today if the loan is already late. */
export function ExtendDialog({ loan, onClose, onExtend }: ExtendDialogProps) {
  return (
    <Dialog
      open={loan !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Extend loan"
      description={loan ? `${loan.borrower.name} · due ${formatDate(loan.expectedReturnDate)}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="extend-form">
            Save new date
          </Button>
        </>
      }
    >
      {loan && <ExtendForm key={loan.id} loan={loan} onExtend={(date) => onExtend(loan, date)} />}
    </Dialog>
  )
}

function ExtendForm({ loan, onExtend }: { loan: Loan; onExtend: (date: string) => void }) {
  const today = todayIso()
  const base = loan.expectedReturnDate > today ? loan.expectedReturnDate : today
  const [date, setDate] = useState(addDays(base, 7))
  const [error, setError] = useState<string>()

  return (
    <form
      id="extend-form"
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (date < loan.startDate) return setError("Can't be before the loan started")
        if (date === loan.expectedReturnDate) return setError("Pick a different date")
        onExtend(date)
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PICKS.map((pick) => {
          const value = addDays(base, pick.days)
          return (
            <button
              key={pick.label}
              type="button"
              onClick={() => {
                setDate(value)
                setError(undefined)
              }}
              aria-pressed={date === value}
              className="h-8 rounded-full border border-border-strong px-3 text-[13px] text-ink-soft transition-colors hover:bg-subtle aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {pick.label}
            </button>
          )
        })}
      </div>
      <Field label="New return date" htmlFor="extend-date" error={error}>
        <Input
          id="extend-date"
          type="date"
          autoFocus
          min={loan.startDate}
          value={date}
          onChange={(event) => {
            setDate(event.target.value)
            setError(undefined)
          }}
        />
      </Field>
    </form>
  )
}
