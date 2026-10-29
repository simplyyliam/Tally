import { useId, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/shared/lib/cn"
import { controlClass } from "./input"

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
}

/**
 * A text box that suggests matches as you type. Arrow keys move through the
 * list; Enter picks the highlighted match only while the list is open, so
 * Enter still submits the form otherwise.
 */
export function Autocomplete({ id, value, onValueChange, options, onPick, placeholder, autoFocus, invalid, describedBy }: AutocompleteProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const visible = open && options.length > 0
  const active = Math.min(highlight, options.length - 1)

  const pick = (option: AutocompleteOption) => {
    onPick(option)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onValueChange(event.target.value)
          setHighlight(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (!visible) return
          if (event.key === "ArrowDown") {
            event.preventDefault()
            setHighlight((index) => (index + 1) % options.length)
          } else if (event.key === "ArrowUp") {
            event.preventDefault()
            setHighlight((index) => (index - 1 + options.length) % options.length)
          } else if (event.key === "Enter") {
            event.preventDefault()
            pick(options[active])
          } else if (event.key === "Escape") {
            setOpen(false)
          }
        }}
        className={cn(controlClass, "h-10 md:h-9")}
      />
      <AnimatePresence>
        {visible && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-64 origin-top overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-pop"
          >
            <li className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium text-faint">Past borrowers</li>
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                // Pick on mousedown so the input doesn't blur first and close the list.
                onMouseDown={(event) => {
                  event.preventDefault()
                  pick(option)
                }}
                onMouseEnter={() => setHighlight(index)}
                className={cn(
                  "flex cursor-default items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm",
                  index === active && "bg-subtle",
                )}
              >
                <span className="truncate font-medium">{option.label}</span>
                {option.detail && <span className="shrink-0 truncate text-xs text-muted-foreground">{option.detail}</span>}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
