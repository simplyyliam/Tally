import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from "@/components/ui/combobox"
import type { BorrowerSuggestion } from "./loan-form"

interface BorrowerNameFieldProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  suggestions: ReadonlyArray<BorrowerSuggestion>
  onPick: (suggestion: BorrowerSuggestion) => void
  invalid?: boolean
  describedBy?: string
}

/**
 * The borrower name, typed freely, with past borrowers suggested in a shadcn
 * Combobox. Picking one fills in their phone, department and work number.
 */
export function BorrowerNameField({ id, value, onValueChange, suggestions, onPick, invalid, describedBy }: BorrowerNameFieldProps) {
  return (
    <Combobox<BorrowerSuggestion>
      items={suggestions as BorrowerSuggestion[]}
      value={null}
      inputValue={value}
      onInputValueChange={(next, details) => {
        // Picking an item resets the input; onPick fills the whole borrower instead.
        if (details.reason !== "item-press") onValueChange(next)
      }}
      onValueChange={(suggestion) => suggestion && onPick(suggestion)}
      itemToStringLabel={(suggestion) => suggestion.details.name}
      filter={null}
    >
      <ComboboxInput
        id={id}
        showTrigger={false}
        placeholder="Start typing a name"
        autoFocus
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="w-full"
      />
      {suggestions.length > 0 && (
        <ComboboxContent>
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxLabel>Past borrowers</ComboboxLabel>
            {suggestions.map((suggestion) => (
              <ComboboxItem key={suggestion.key} value={suggestion}>
                <span className="min-w-0 flex-1 truncate">{suggestion.details.name}</span>
                {suggestion.detail && <span className="shrink-0 truncate text-xs font-normal text-muted-foreground">{suggestion.detail}</span>}
              </ComboboxItem>
            ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  )
}
