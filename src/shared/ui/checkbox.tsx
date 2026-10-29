import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/shared/lib/cn"

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  id?: string
  className?: string
}

export function Checkbox({ checked, indeterminate, onCheckedChange, label, id, className }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(value) => onCheckedChange(value)}
      aria-label={label}
      className={cn(
        "relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-background shadow-card",
        "transition-[background-color,border-color,transform] duration-150 outline-none active:scale-90",
        "focus-visible:ring-3 focus-visible:ring-ring/30",
        "data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary",
        "before:absolute before:-inset-2.5 before:content-['']",
        className,
      )}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        className="text-white transition-[opacity,scale] duration-150 data-[unchecked]:scale-50 data-[unchecked]:opacity-0"
      >
        {indeterminate ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
