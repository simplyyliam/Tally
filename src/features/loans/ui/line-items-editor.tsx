import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { LoanDraft } from "../domain/loan"
import type { DraftErrors } from "../domain/validate-draft"

type DraftLine = LoanDraft["lines"][number]

interface LineItemsEditorProps {
  formId: string
  lines: DraftLine[]
  errors: DraftErrors
  onChange: (lines: DraftLine[]) => void
}

/** One row per item: what it is and how many. Most loans are "3 cords and a projector", so adding a row is one tap. */
export function LineItemsEditor({ formId, lines, errors, onChange }: LineItemsEditorProps) {
  const setLine = (index: number, patch: Partial<DraftLine>) => {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  const addLine = () => {
    onChange([...lines, { description: "", quantity: 1 }])
    // Focus the new row once it has rendered.
    requestAnimationFrame(() => document.getElementById(`${formId}-lines-${lines.length}-description`)?.focus())
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {lines.map((line, index) => {
          const descriptionId = `${formId}-lines-${index}-description`
          const error = errors[`lines.${index}.description`] ?? errors[`lines.${index}.quantity`]
          return (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-right text-xs text-faint tabular">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={descriptionId} className="sr-only">
                    Item {index + 1}
                  </label>
                  <Input
                    id={descriptionId}
                    placeholder={index === 0 ? "e.g. Extension cord" : "Another item"}
                    value={line.description}
                    aria-invalid={Boolean(errors[`lines.${index}.description`]) || undefined}
                    onChange={(event) => setLine(index, { description: event.target.value })}
                  />
                  {error && (
                    <p role="alert" className="mt-1 text-xs text-red-text">
                      {error}
                    </p>
                  )}
                </div>
                <QuantityStepper
                  id={`${formId}-lines-${index}-quantity`}
                  value={line.quantity}
                  onChange={(quantity) => setLine(index, { quantity })}
                  label={`Quantity for item ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => onChange(lines.filter((_, i) => i !== index))}
                  className="h-10 md:h-9"
                >
                  <Trash2 />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      {errors.lines && <p className="text-xs text-red-text">{errors.lines}</p>}
      <div className="pl-7">
        <Button type="button" variant="ghost" size="sm" onClick={addLine} className="-ml-2.5 text-foreground">
          <Plus />
          Add item
        </Button>
      </div>
    </div>
  )
}

/** A number with − and + buttons, built from the shadcn InputGroup. */
export function QuantityStepper({
  id,
  value,
  onChange,
  label,
  min = 1,
  max = 9999,
}: {
  id: string
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))
  return (
    <InputGroup className="w-[7.5rem] shrink-0">
      <InputGroupAddon>
        <InputGroupButton size="icon-xs" tabIndex={-1} aria-label="Decrease" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        aria-label={label}
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value.replace(/D/g, ""), 10)
          onChange(Number.isNaN(parsed) ? min : clamp(parsed))
        }}
        onFocus={(event) => event.target.select()}
        className="px-0 text-center font-medium tabular"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" tabIndex={-1} aria-label="Increase" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
