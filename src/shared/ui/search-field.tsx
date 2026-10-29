import type { ComponentProps, Ref } from "react"
import { Search, X } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/shared/lib/cn"

interface SearchFieldProps extends Omit<ComponentProps<"input">, "onChange"> {
  value: string
  onValueChange: (value: string) => void
  shortcut?: string
  ref?: Ref<HTMLInputElement>
}

/** The search box from the table reference, built from the shadcn InputGroup and Kbd. */
export function SearchField({ value, onValueChange, shortcut, className, placeholder = "Search", ref, ...props }: SearchFieldProps) {
  return (
    <InputGroup className={cn("h-10 rounded-xl border-border-strong bg-background shadow-card md:h-9", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="[&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {value ? (
          <InputGroupButton size="icon-xs" variant="ghost" aria-label="Clear search" onClick={() => onValueChange("")}>
            <X />
          </InputGroupButton>
        ) : (
          shortcut && <Kbd className="hidden md:inline-flex">{shortcut}</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  )
}
