import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Field as ShadcnField, FieldDescription, FieldLabel } from "@/components/ui/field"
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

/** The shadcn Field with a label, the control, then a hint or an error that slides in under it. */
export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <ShadcnField data-invalid={Boolean(error) || undefined} className={cn("gap-1.5", className)}>
      <FieldLabel htmlFor={htmlFor} className="items-baseline gap-1.5 text-[13px]">
        {label}
        {optional && <span className="text-xs font-normal text-faint">Optional</span>}
      </FieldLabel>
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
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <FieldDescription key="hint" className="text-xs">
            {hint}
          </FieldDescription>
        ) : null}
      </AnimatePresence>
    </ShadcnField>
  )
}
