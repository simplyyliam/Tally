import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/shared/lib/cn"

interface FieldProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string
  optional?: boolean
  className?: string
  children: ReactNode
}

/** Label, control, then either a hint or an error that slides in under it. */
export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-[13px] font-medium text-foreground">
        {label}
        {optional && <span className="text-xs font-normal text-faint">Optional</span>}
      </label>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${htmlFor}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-red-text"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" className="text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
