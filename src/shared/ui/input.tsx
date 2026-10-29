import type { ComponentProps } from "react"
import { Input as ShadcnInput } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { cn } from "@/shared/lib/cn"

/**
 * shadcn Input, Textarea and NativeSelect with Tally's calmer corners and a
 * hairline border, applied through className so the shadcn files stay as-is.
 */
export const controlClass = "rounded-lg border-border-strong bg-background shadow-card dark:bg-input/30"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <ShadcnInput className={cn(controlClass, "h-10 md:h-9", className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <ShadcnTextarea className={cn(controlClass, "min-h-20 py-2", className)} {...props} />
}

/**
 * Native on purpose: it opens the phone's own picker, the fastest on a small
 * screen. shadcn puts className on the wrapper, so the select is styled via [&>select].
 */
export function Select({ className, ...props }: ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect
      className={cn(
        "[&>select]:h-10 [&>select]:rounded-lg [&>select]:border-border-strong [&>select]:bg-background [&>select]:shadow-card md:[&>select]:h-9",
        className,
      )}
      {...props}
    />
  )
}
