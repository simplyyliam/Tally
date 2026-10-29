import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/shared/lib/cn"

interface BannerProps {
  icon: ReactNode
  tone?: "amber" | "red" | "blue"
  children: ReactNode
  action?: ReactNode
}

/** A slim, gentle strip across the top of the content area. */
export function Banner({ icon, tone = "amber", children, action }: BannerProps) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5 text-[13px] md:px-6 [&>svg]:size-4 [&>svg]:shrink-0",
          tone === "amber" && "border-amber-text/15 bg-amber-tint text-amber-text",
          tone === "red" && "border-red-text/15 bg-red-tint text-red-text",
          tone === "blue" && "border-blue-text/15 bg-blue-tint text-blue-text",
        )}
      >
        {icon}
        <p className="min-w-0 flex-1">{children}</p>
        {action}
      </div>
    </motion.div>
  )
}
