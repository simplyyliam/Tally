import type { ReactNode } from "react"
import { Dialog as ShadcnDialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/shared/lib/cn"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Extra controls next to the title, e.g. a reference pill. */
  headerExtra?: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg"
  children?: ReactNode
}

const widths = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" }

/**
 * The shadcn Dialog laid out for Tally: a header, a scrolling body and a
 * sticky footer. On a phone it sits at the bottom like a sheet so the thumb
 * reaches the buttons. Styling is passed in via className; the shadcn
 * component itself is untouched.
 */
export function Dialog({ open, onOpenChange, title, description, headerExtra, footer, size = "md", children }: DialogProps) {
  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[86dvh] flex-col gap-0 overflow-hidden rounded-xl p-0",
          "max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none",
          widths[size],
        )}
      >
        <DialogHeader className="border-b border-border px-5 pt-4 pb-3.5 pr-14 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-base font-semibold tracking-[-0.01em]">{title}</DialogTitle>
            {headerExtra}
          </div>
          {description && <DialogDescription className="text-[13px]">{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
        {footer && (
          <DialogFooter className="border-t border-border bg-sidebar px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] md:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </ShadcnDialog>
  )
}
