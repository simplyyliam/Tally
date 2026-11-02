import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { addDays, formatDate, todayIso } from "@/shared/lib/dates"
import { DatePicker } from "@/shared/ui/date-picker"
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
    <Dialog open={loan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend loan</DialogTitle>
          {loan && (
            <DialogDescription>
              {loan.reference} · {loan.borrower.name} · due {formatDate(loan.expectedReturnDate)}
            </DialogDescription>
          )}
        </DialogHeader>
        {loan && <ExtendForm key={loan.id} loan={loan} onExtend={(date) => onExtend(loan, date)} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="extend-form">
            Save new date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ExtendForm({ loan, onExtend }: { loan: Loan; onExtend: (date: string) => void }) {
  const today = todayIso()
  const base = loan.expectedReturnDate > today ? loan.expectedReturnDate : today
  const [date, setDate] = useState(addDays(base, 7))
  const [error, setError] = useState<string>()
  const pickValue = QUICK_PICKS.find((pick) => addDays(base, pick.days) === date)?.label

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
      <ToggleGroup
        variant="outline"
        size="sm"
        value={pickValue ? [pickValue] : []}
        onValueChange={(values: string[]) => {
          const pick = QUICK_PICKS.find((item) => item.label === values[0])
          if (!pick) return
          setDate(addDays(base, pick.days))
          setError(undefined)
        }}
        className="flex-wrap"
      >
        {QUICK_PICKS.map((pick) => (
          <ToggleGroupItem key={pick.label} value={pick.label}>
            {pick.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Field data-invalid={Boolean(error) || undefined}>
        <FieldLabel htmlFor="extend-date">New return date</FieldLabel>
        <DatePicker
          id="extend-date"
          min={loan.startDate}
          value={date}
          onChange={(next) => {
            setDate(next)
            setError(undefined)
          }}
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </form>
  )
}
