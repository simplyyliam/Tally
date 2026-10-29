import type { ComponentProps, ReactNode } from "react"
import { CornerDownRight } from "lucide-react"
import { cn } from "@/shared/lib/cn"

/**
 * An outlined, fully round suggestion pill with a "↳" lead, like the
 * "Follow up" prompts in the sidebar reference and shadcn AI Elements'
 * Suggestion. Used for quick next steps ("Issue another loan to Thandi").
 */
export function Suggestion({ icon, className, children, ...props }: ComponentProps<"button"> & { icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border-strong bg-background px-3.5 py-1.5 text-left text-[13px] text-ink-soft shadow-card",
        "transition-[background-color,border-color,transform] duration-150 hover:border-ring/50 hover:bg-sidebar active:scale-[0.98]",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-faint",
        className,
      )}
      {...props}
    >
      {icon ?? <CornerDownRight />}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  )
}
