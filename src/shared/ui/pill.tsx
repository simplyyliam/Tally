import type { ComponentProps, ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/lib/cn"

/**
 * Pills as in the references, built on the shadcn Badge: a pale tint with
 * darker text for status, soft grey for neutral tags, and an outlined variant
 * for counts like "+2".
 */
const TONES = {
  green: "bg-green-tint text-green-text",
  amber: "bg-amber-tint text-amber-text",
  red: "bg-red-tint text-red-text",
  blue: "bg-blue-tint text-blue-text",
  purple: "bg-purple-tint text-purple-text",
  grey: "bg-grey-tint text-grey-text",
  outline: "border-border-strong bg-background text-muted-foreground",
} as const

const SIZES = {
  sm: "h-5 px-2 text-[11px]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-8 px-3 text-[13px]",
} as const

export type PillTone = keyof typeof TONES

interface PillProps extends ComponentProps<"span"> {
  tone?: PillTone
  size?: keyof typeof SIZES
  icon?: ReactNode
}

export function Pill({ tone = "grey", size = "md", icon, className, children, ...props }: PillProps) {
  return (
    <Badge variant="secondary" className={cn("gap-1.5 rounded-full [&>svg]:size-3.5!", TONES[tone], SIZES[size], className)} {...props}>
      {icon}
      {children}
    </Badge>
  )
}

/** A tiny counter, like the red "3" next to Activity in the sidebar reference. */
export function CountBadge({ count, tone = "red", className }: { count: number; tone?: "red" | "grey"; className?: string }) {
  if (count <= 0) return null
  return (
    <Badge
      variant={tone === "red" ? "destructive" : "secondary"}
      className={cn(
        "h-[18px] min-w-[18px] rounded-[5px] px-1 text-[11px] font-semibold tabular",
        tone === "red" && "bg-red-text text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  )
}
