import type { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/cn"

/**
 * Pills as in the references: a pale tint with darker text for status,
 * a soft grey fill for neutral tags, and an outlined variant for counts
 * like "+2". Fully round, compact, never shouting.
 */
const pillVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        green: "bg-green-tint text-green-text",
        amber: "bg-amber-tint text-amber-text",
        red: "bg-red-tint text-red-text",
        blue: "bg-blue-tint text-blue-text",
        purple: "bg-purple-tint text-purple-text",
        grey: "bg-grey-tint text-grey-text",
        outline: "border border-border-strong bg-background text-muted-foreground",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
        lg: "h-8 px-3 text-[13px]",
      },
    },
    defaultVariants: { tone: "grey", size: "md" },
  },
)

export type PillTone = NonNullable<VariantProps<typeof pillVariants>["tone"]>

interface PillProps extends ComponentProps<"span">, VariantProps<typeof pillVariants> {
  icon?: ReactNode
}

export function Pill({ tone, size, icon, className, children, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ tone, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  )
}

/** A tiny round counter, like the red "3" next to Activity in the sidebar reference. */
export function CountBadge({ count, tone = "red", className }: { count: number; tone?: "red" | "grey"; className?: string }) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 text-[11px] font-semibold tabular",
        tone === "red" ? "bg-red-text text-white" : "bg-subtle-strong text-muted-foreground",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
