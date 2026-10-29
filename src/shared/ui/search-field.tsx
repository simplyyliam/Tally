import { forwardRef, type ComponentProps } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/shared/lib/cn"

interface SearchFieldProps extends Omit<ComponentProps<"input">, "onChange"> {
  value: string
  onValueChange: (value: string) => void
  shortcut?: string
}

/** The search box from the table reference: icon, quiet placeholder and a keyboard hint. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onValueChange, shortcut, className, placeholder = "Search", ...props },
  ref,
) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-3 size-4 text-faint" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-border-strong bg-background pr-14 pl-9 text-sm shadow-card outline-none md:h-9",
          "placeholder:text-faint transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute right-2 inline-flex size-6 items-center justify-center rounded-md text-faint hover:bg-subtle hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        shortcut && <Kbd className="pointer-events-none absolute right-2 hidden md:inline-flex">{shortcut}</Kbd>
      )}
    </div>
  )
})

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-border-strong bg-sidebar px-1.5 font-sans text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  )
}
