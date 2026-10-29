import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/shared/lib/cn"

export { Skeleton }

/**
 * Text with a light sweeping across it, after the "Thinking…" Shimmer in
 * shadcn AI Elements (not in the base shadcn registry, so it lives here).
 * Used for short waiting messages ("Reading your file…").
 */
export function ShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "animate-shimmer bg-[linear-gradient(90deg,var(--faint)_0%,var(--faint)_40%,var(--foreground)_50%,var(--faint)_60%,var(--faint)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Rows of shadcn Skeletons shaped like the loan table. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="divide-y divide-border">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4" style={{ opacity: 1 - index * 0.12 }}>
          <Skeleton className="size-4 rounded-[5px]" />
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="h-3.5 w-48 flex-1 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  )
}
