import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/shared/lib/cn"

export interface TimelineEntry {
  id: string
  icon?: ReactNode
  title: ReactNode
  meta?: ReactNode
  children?: ReactNode
}

/**
 * A vertical history with a thin dashed rail and small nodes, after the
 * agent steps reference and AI Elements' Chain of Thought. Used for the
 * activity log on each loan.
 */
export function Timeline({ entries, className }: { entries: ReadonlyArray<TimelineEntry>; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {entries.map((entry, index) => (
        <motion.li
          key={entry.id}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.25 }}
          className="relative flex gap-3 pb-4 last:pb-0"
        >
          {index < entries.length - 1 && (
            <span aria-hidden className="absolute top-6 bottom-0 left-[11px] border-l border-dashed border-border-strong" />
          )}
          <span className="relative z-10 mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&_svg]:size-3.5">
            {entry.icon ?? <span className="size-1.5 rounded-full bg-faint" />}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="text-[13px] text-foreground">{entry.title}</p>
              {entry.meta && <p className="text-xs text-faint tabular">{entry.meta}</p>}
            </div>
            {entry.children && <div className="mt-1 text-xs text-muted-foreground">{entry.children}</div>}
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
