import type { ReactNode } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
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

const widths = { sm: "md:max-w-md", md: "md:max-w-xl", lg: "md:max-w-3xl" }

/**
 * Modal dialog. On a phone it rises as a bottom sheet so the thumb can reach
 * the buttons; on desktop it is a centred card with a soft scale-in.
 */
export function Dialog({ open, onOpenChange, title, description, headerExtra, footer, size = "md", children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed z-50 flex max-h-[92dvh] w-full flex-col bg-card text-foreground shadow-pop outline-none",
            "inset-x-0 bottom-0 rounded-t-xl",
            "md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[86dvh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl",
            widths[size],
            "transition-[opacity,transform,translate,scale] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-[starting-style]:translate-y-8 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-8 data-[ending-style]:opacity-0",
            "md:data-[starting-style]:translate-y-[-48%] md:data-[starting-style]:scale-[0.97] md:data-[ending-style]:translate-y-[-48%] md:data-[ending-style]:scale-[0.97]",
          )}
        >
          <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-subtle-strong md:hidden" aria-hidden />
          <header className="flex items-start gap-3 border-b border-border px-5 pt-4 pb-3.5 md:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogPrimitive.Title className="text-base font-semibold tracking-[-0.01em]">{title}</DialogPrimitive.Title>
                {headerExtra}
              </div>
              {description && (
                <DialogPrimitive.Description className="mt-0.5 text-[13px] text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="-mr-1.5 inline-flex size-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-subtle hover:text-foreground"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
          {footer && (
            <footer className="flex flex-col-reverse gap-2 border-t border-border bg-sidebar px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end md:rounded-b-xl md:px-6">
              {footer}
            </footer>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
