import type { ComponentProps } from "react"
import { Button as ShadcnButton } from "@/components/ui/button"
import { cn } from "@/shared/lib/cn"

/**
 * Tally's button: the shadcn Button (left untouched in src/components/ui)
 * with Tally's variants layered on through className. `cn` merges Tailwind
 * classes, so these override shadcn's defaults without editing the component.
 */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm"

const SHADCN_VARIANT = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
  success: "secondary",
} as const

const SHADCN_SIZE = { sm: "sm", md: "default", lg: "lg", icon: "icon", "icon-sm": "icon-sm" } as const

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.12)] hover:bg-primary/85",
  secondary: "hover:bg-subtle-strong",
  outline: "border-border-strong shadow-card hover:bg-subtle",
  ghost: "text-muted-foreground hover:bg-subtle",
  danger: "bg-red-tint text-red-text hover:bg-[color-mix(in_oklab,var(--red-tint),var(--red-text)_10%)]",
  success: "bg-green-tint text-green-text hover:bg-[color-mix(in_oklab,var(--green-tint),var(--green-text)_10%)]",
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2.5 text-[13px]",
  md: "px-3.5",
  lg: "h-11 px-5 text-[15px]",
  icon: "",
  "icon-sm": "",
}

type ButtonProps = Omit<ComponentProps<typeof ShadcnButton>, "variant" | "size"> & {
  variant?: Variant
  size?: Size
}

export function Button({ variant = "outline", size = "md", className, ...props }: ButtonProps) {
  return (
    <ShadcnButton
      variant={SHADCN_VARIANT[variant]}
      size={SHADCN_SIZE[size]}
      // Calmer corners than shadcn's pill default, and a soft press.
      className={cn("rounded-lg active:scale-[0.97] disabled:opacity-45", VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    />
  )
}
