import type { ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

/**
 * Text with a light sweeping across it, after the "Thinking…" Shimmer in
 * shadcn AI Elements, which isn't in the base shadcn registry. Used for short
 * waiting messages ("Reading your file…").
 */
export function ShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "animate-shimmer bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%,var(--muted-foreground)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  )
}
