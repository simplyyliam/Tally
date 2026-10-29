import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"
import { plural } from "@/shared/lib/text"
import type { Loan } from "../domain/loan"
import { outstandingLines, remainingQuantity } from "../domain/status"
import { QuantityStepper } from "./line-items-editor"

interface ReturnDialogProps {
  loan: Loan | null
  onClose: () => void
  onReturn: (loan: Loan, returning: Record<string, number>) => void
}

/**
 * Check items back in. Everything still out is pre-filled, so a full return is
 * Return → Enter; for a partial return, lower the counts of what stays out.
 */
export function ReturnDialog({ loan, onClose, onReturn }: ReturnDialogProps) {
  return (
    <Dialog open={loan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Return items</DialogTitle>
          {loan && (
            <DialogDescription>
              {loan.reference} · {loan.borrower.name}
            </DialogDescription>
          )}
        </DialogHeader>
        {loan && <ReturnForm key={loan.id} loan={loan} onReturn={(returning) => onReturn(loan, returning)} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function ReturnForm({ loan, onReturn, onClose }: { loan: Loan; onReturn: (returning: Record<string, number>) => void; onClose: () => void }) {
  const lines = outstandingLines(loan)
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(lines.map((line) => [line.id, remainingQuantity(line)])))
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const stillOut = lines.reduce((sum, line) => sum + remainingQuantity(line), 0) - total

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (total > 0) onReturn(counts)
      }}
    >
      <ItemGroup className="gap-2">
        {lines.map((line) => (
          <Item key={line.id} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>{line.description}</ItemTitle>
              <ItemDescription>
                {remainingQuantity(line)} of {line.quantity} still out
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <QuantityStepper
                id={`return-${line.id}`}
                label={`How many ${line.description} came back`}
                min={0}
                max={remainingQuantity(line)}
                value={counts[line.id] ?? 0}
                onChange={(value) => setCounts((current) => ({ ...current, [line.id]: value }))}
              />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      <DialogFooter className="items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {stillOut > 0 ? `${plural(stillOut, "item")} will stay out` : "Everything comes back"}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={total === 0} autoFocus>
            Return {plural(total, "item")}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
