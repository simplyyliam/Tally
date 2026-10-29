import type { ReactNode } from "react"
import { Button } from "./button"
import { Dialog } from "./dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  tone?: "danger" | "primary"
  onConfirm: () => void
  children?: ReactNode
}

/** Asks before anything that can't be undone. The safe choice (Cancel) is always first. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, tone = "danger", onConfirm, children }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  )
}
