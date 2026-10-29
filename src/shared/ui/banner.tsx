import type { ReactNode } from "react"
import { motion } from "motion/react"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/shared/lib/cn"

interface BannerProps {
  icon: ReactNode
  tone?: "amber" | "red" | "blue"
  children: ReactNode
  action?: ReactNode
}

const TONES = {
  amber: "border-amber-text/15 bg-amber-tint text-amber-text *:data-[slot=alert-description]:text-amber-text",
  red: "border-red-text/15 bg-red-tint text-red-text *:data-[slot=alert-description]:text-red-text",
  blue: "border-blue-text/15 bg-blue-tint text-blue-text *:data-[slot=alert-description]:text-blue-text",
}

/** A slim strip across the top of the content area, made from the shadcn Alert. */
export function Banner({ icon, tone = "amber", children, action }: BannerProps) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <Alert className={cn("rounded-none border-x-0 border-t-0 px-4 py-2.5 md:px-6", TONES[tone])}>
        {icon}
        <AlertDescription className="text-[13px]">{children}</AlertDescription>
        {action && <AlertAction>{action}</AlertAction>}
      </Alert>
    </motion.div>
  )
}
