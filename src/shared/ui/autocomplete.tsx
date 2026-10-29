import type { ReactNode } from "react"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from "@/components/ui/combobox"
import { cn } from "@/shared/lib/cn"

export interface AutocompleteOption {
  key: string
  label: string
  detail?: ReactNode
}

interface AutocompleteProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  options: ReadonlyArray<AutocompleteOption>
  onPick: (option: AutocompleteOption) => void
  placeholder?: string
  autoFocus?: boolean
  invalid?: boolean
  describedBy?: string
  groupLabel?: string
}

/**
 * Free text with suggestions, built on the shadcn Combobox. What's typed is
 * kept as typed; picking a suggestion calls onPick so the form can fill in
 * the rest. Filtering is done by the caller, so the list shows exactly what
 * it is given.
 */
export function Autocomplete({ id, value, onValueChange, options, onPick, placeholder, autoFocus, invalid, describedBy, groupLabel }: AutocompleteProps) {
  return (
    <Combobox<AutocompleteOption>
      items={options as AutocompleteOption[]}
      value={null}
      inputValue={value}
      onInputValueChange={(next, details) => {
        // Ignore the input being reset when an item is picked; onPick handles that.
        if (details.reason !== "item-press") onValueChange(next)
      }}
      onValueChange={(option) => option && onPick(option)}
      itemToStringLabel={(option) => option.label}
      filter={null}
    >
      <ComboboxInput
        id={id}
        showTrigger={false}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn("h-10 w-full rounded-lg border-border-strong bg-background shadow-card md:h-9")}
      />
      {options.length > 0 && (
        <ComboboxContent className="rounded-xl">
          <ComboboxList>
            {groupLabel && <ComboboxLabel>{groupLabel}</ComboboxLabel>}
            {options.map((option) => (
              <ComboboxItem key={option.key} value={option} className="rounded-lg">
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.detail && <span className="shrink-0 truncate text-xs font-normal text-muted-foreground">{option.detail}</span>}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  )
}
