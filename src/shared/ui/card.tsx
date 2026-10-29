import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

/** A white surface with a hairline border. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-border bg-card shadow-card", className)} {...props} />
}

interface PanelProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/**
 * The grouped card from the "Outcome" reference: a soft grey frame holding a
 * title row, with the content on a white inset card.
 */
export function Panel({ title, description, action, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn("rounded-xl bg-subtle/70 p-1", className)}>
      <header className="flex min-h-10 items-center justify-between gap-3 px-3 pt-1.5 pb-1">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-ink-soft">{title}</h2>
          {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className={cn("rounded-lg border border-border bg-card shadow-card", bodyClassName)}>{children}</div>
    </section>
  )
}
