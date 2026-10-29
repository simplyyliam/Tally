import type { ReactNode } from "react"
import { motion } from "motion/react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/shared/lib/cn"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

/** The shadcn Empty state with a soft fade-in. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1"
    >
      <Empty className={cn("py-14", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="rounded-xl border border-border bg-background text-muted-foreground shadow-card">
            {icon}
          </EmptyMedia>
          <EmptyTitle className="text-sm">{title}</EmptyTitle>
          {description && <EmptyDescription className="text-[13px]">{description}</EmptyDescription>}
        </EmptyHeader>
        {action && <EmptyContent className="flex-row flex-wrap justify-center">{action}</EmptyContent>}
      </Empty>
    </motion.div>
  )
}
