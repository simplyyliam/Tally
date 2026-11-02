import type { ReactNode } from "react"
import { cn } from "@/shared/lib/cn"
import { AnimatedNumber } from "@/shared/ui/animated-number"

interface StatCellProps {
  label: string
  value: number
  icon: ReactNode
  hint: string
  tone?: "red" | "amber"
  onClick?: () => void
}

/** One number in the "Right now" panel, laid out like the "Replied 45 / vs last period" cells in the reference. */
export function StatCell({ label, value, icon, hint, tone, onClick }: StatCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-2 bg-card p-4 text-left transition-colors outline-none hover:bg-sidebar focus-visible:bg-sidebar md:p-5"
    >
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full bg-subtle text-muted-foreground [&_svg]:size-3.5",
            tone === "red" && "bg-red-tint text-red-text",
            tone === "amber" && "bg-amber-tint text-amber-text",
          )}
        >
          {icon}
        </span>
        <AnimatedNumber value={value} className={cn("text-2xl font-semibold tracking-tight tabular", tone === "red" && "text-red-text")} />
      </span>
      <span className="truncate text-xs text-faint transition-colors group-hover:text-muted-foreground">{hint}</span>
    </button>
  )
}
