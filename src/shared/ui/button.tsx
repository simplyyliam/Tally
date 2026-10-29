import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/cn"

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent",
    "text-sm font-medium whitespace-nowrap select-none outline-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
    "focus-visible:ring-3 focus-visible:ring-ring/35 active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary/85",
        secondary: "bg-subtle text-foreground hover:bg-subtle-strong",
        outline: "border-border-strong bg-background text-foreground shadow-card hover:bg-subtle",
        ghost: "text-muted-foreground hover:bg-subtle hover:text-foreground",
        danger: "bg-red-tint text-red-text hover:bg-[color-mix(in_oklab,var(--red-tint),var(--red-text)_10%)]",
        success: "bg-green-tint text-green-text hover:bg-[color-mix(in_oklab,var(--green-tint),var(--green-text)_10%)]",
      },
      size: {
        sm: "h-8 px-2.5 text-[13px]",
        md: "h-9 px-3.5",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
)

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants }
