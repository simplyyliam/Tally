import type { ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

interface PageHeaderProps {
  icon?: ReactNode
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * The top bar of every screen. The title sits in a soft grey chip like the
 * conversation title in the sidebar reference, with actions on the right.
 */
export function PageHeader({ icon, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <h1 className="inline-flex h-8 min-w-0 items-center gap-2 rounded-lg bg-subtle px-2.5 text-[15px] font-medium tracking-[-0.01em] text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          {icon}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <div className="hidden min-w-0 truncate text-[13px] text-muted-foreground sm:block">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
