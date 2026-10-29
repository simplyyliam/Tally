import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/shared/lib/cn"

interface PanelProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/**
 * The grouped card from the "Outcome" reference: a soft grey frame with a
 * title row, holding the content on a white shadcn Card.
 */
export function Panel({ title, description, action, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn("rounded-xl bg-muted/70 p-1", className)}>
      <header className="flex min-h-10 items-center justify-between gap-3 px-3 pt-1.5 pb-1">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-ink-soft">{title}</h2>
          {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <Card className={cn("gap-0 rounded-lg py-0 shadow-card ring-border", bodyClassName)}>{children}</Card>
    </section>
  )
}
