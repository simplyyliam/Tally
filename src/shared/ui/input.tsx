import type { ComponentProps } from "react"
import { cn } from "@/shared/lib/cn"

export const controlClass = cn(
  "w-full min-w-0 rounded-lg border border-border-strong bg-background px-3 text-sm text-foreground shadow-card",
  "placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150",
  "hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
  "aria-invalid:border-red-text/50 aria-invalid:ring-3 aria-invalid:ring-red-text/10",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={cn(controlClass, "h-10 md:h-9", className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(controlClass, "min-h-20 py-2 leading-relaxed", className)} {...props} />
}

/** A native select styled like the filter pills in the references; native keeps it reliable on phones. */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(controlClass, "h-10 cursor-pointer appearance-none pr-8 md:h-9", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
