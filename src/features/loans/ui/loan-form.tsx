import { useState, type FormEvent, type ReactNode } from "react"
import { Field } from "@/shared/ui/field"
import { Input, Textarea } from "@/shared/ui/input"
import { Autocomplete } from "@/shared/ui/autocomplete"
import { formatPhone } from "@/shared/lib/phone"
import type { BorrowerDetails, LoanDraft } from "../domain/loan"
import { validateDraft, type DraftErrors } from "../domain/validate-draft"
import { LineItemsEditor } from "./line-items-editor"

export interface BorrowerSuggestion {
  key: string
  details: BorrowerDetails
  /** Short extra text in the list, e.g. department or phone. */
  detail?: string
}

interface LoanFormProps {
  /** Lets a submit button outside the form (in the dialog footer) submit it. */
  formId: string
  initial: LoanDraft
  findBorrowers?: (query: string) => BorrowerSuggestion[]
  /** Rendered under the borrower fields, e.g. the WhatsApp consent toggle. */
  borrowerExtra?: (borrower: BorrowerDetails) => ReactNode
  onBorrowerPicked?: (suggestion: BorrowerSuggestion) => void
  onSubmit: (draft: LoanDraft) => void | Promise<void>
}

/**
 * The loan form. Built for speed at the counter: the name field suggests past
 * borrowers and fills their details, Tab moves through every field in order,
 * and Enter saves from anywhere except the notes box.
 */
export function LoanForm({ formId, initial, findBorrowers, borrowerExtra, onBorrowerPicked, onSubmit }: LoanFormProps) {
  const [draft, setDraft] = useState<LoanDraft>(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const setBorrower = (patch: Partial<BorrowerDetails>) => {
    setDraft((current) => ({ ...current, borrower: { ...current.borrower, ...patch } }))
  }

  const revalidate = (next: LoanDraft) => {
    if (!submitted) return
    const result = validateDraft(next)
    setErrors(result.ok ? {} : result.errors)
  }

  const update = (next: LoanDraft) => {
    setDraft(next)
    revalidate(next)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const result = validateDraft(draft)
    if (!result.ok) {
      setErrors(result.errors)
      const firstField = Object.keys(result.errors)[0]
      document.getElementById(fieldId(formId, firstField))?.focus()
      return
    }
    setErrors({})
    await onSubmit(result.draft)
  }

  const suggestions = findBorrowers && draft.borrower.name.trim().length >= 1 ? findBorrowers(draft.borrower.name) : []
  const id = (path: string) => fieldId(formId, path)
  const errorProps = (path: string) =>
    errors[path] ? { "aria-invalid": true as const, "aria-describedby": `${id(path)}-error` } : {}

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      <FormSection title="Borrower">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" htmlFor={id("borrower.name")} error={errors["borrower.name"]} className="md:col-span-2">
            <Autocomplete
              id={id("borrower.name")}
              autoFocus
              value={draft.borrower.name}
              placeholder="Start typing a name"
              invalid={Boolean(errors["borrower.name"])}
              describedBy={errors["borrower.name"] ? `${id("borrower.name")}-error` : undefined}
              onValueChange={(name) => update({ ...draft, borrower: { ...draft.borrower, name } })}
              options={suggestions.map((suggestion) => ({
                key: suggestion.key,
                label: suggestion.details.name,
                detail: suggestion.detail,
              }))}
              onPick={(option) => {
                const picked = suggestions.find((suggestion) => suggestion.key === option.key)
                if (!picked) return
                update({ ...draft, borrower: { ...picked.details } })
                onBorrowerPicked?.(picked)
              }}
            />
          </Field>
          <Field label="Cellphone" htmlFor={id("borrower.cellphone")} error={errors["borrower.cellphone"]}>
            <Input
              id={id("borrower.cellphone")}
              type="tel"
              inputMode="tel"
              placeholder="082 123 4567"
              value={draft.borrower.cellphone}
              onChange={(event) => setBorrower({ cellphone: event.target.value })}
              onBlur={() => draft.borrower.cellphone && setBorrower({ cellphone: formatPhone(draft.borrower.cellphone) })}
              {...errorProps("borrower.cellphone")}
            />
          </Field>
          <Field
            label="WhatsApp"
            htmlFor={id("borrower.whatsapp")}
            optional
            hint={!errors["borrower.whatsapp"] ? "Leave empty if it's the same as the cellphone" : undefined}
            error={errors["borrower.whatsapp"]}
          >
            <Input
              id={id("borrower.whatsapp")}
              type="tel"
              inputMode="tel"
              placeholder="Same as cellphone"
              value={draft.borrower.whatsapp}
              onChange={(event) => setBorrower({ whatsapp: event.target.value })}
              onBlur={() => draft.borrower.whatsapp && setBorrower({ whatsapp: formatPhone(draft.borrower.whatsapp) })}
              {...errorProps("borrower.whatsapp")}
            />
          </Field>
          <Field label="Section or department" htmlFor={id("borrower.department")} optional>
            <Input
              id={id("borrower.department")}
              placeholder="e.g. Maintenance"
              value={draft.borrower.department}
              onChange={(event) => setBorrower({ department: event.target.value })}
            />
          </Field>
          <Field label="Employee / work number" htmlFor={id("borrower.employeeNumber")} optional>
            <Input
              id={id("borrower.employeeNumber")}
              placeholder="e.g. E1042"
              value={draft.borrower.employeeNumber}
              onChange={(event) => setBorrower({ employeeNumber: event.target.value })}
            />
          </Field>
        </div>
        {borrowerExtra?.(draft.borrower)}
      </FormSection>

      <FormSection title="Items">
        <LineItemsEditor
          formId={formId}
          lines={draft.lines}
          errors={errors}
          onChange={(lines) => update({ ...draft, lines })}
        />
      </FormSection>

      <FormSection title="Dates">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor={id("startDate")} error={errors.startDate}>
            <Input
              id={id("startDate")}
              type="date"
              value={draft.startDate}
              onChange={(event) => update({ ...draft, startDate: event.target.value })}
              {...errorProps("startDate")}
            />
          </Field>
          <Field label="Expected return date" htmlFor={id("expectedReturnDate")} error={errors.expectedReturnDate}>
            <Input
              id={id("expectedReturnDate")}
              type="date"
              min={draft.startDate}
              value={draft.expectedReturnDate}
              onChange={(event) => update({ ...draft, expectedReturnDate: event.target.value })}
              {...errorProps("expectedReturnDate")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Details">
        <div className="grid gap-4">
          <Field label="Issued by" htmlFor={id("issuedBy")} hint="The staff member handing the items over">
            <Input
              id={id("issuedBy")}
              placeholder="Your name"
              value={draft.issuedBy}
              onChange={(event) => setDraft({ ...draft, issuedBy: event.target.value })}
            />
          </Field>
          <Field label="Notes" htmlFor={id("notes")} optional>
            <Textarea
              id={id("notes")}
              rows={2}
              placeholder="Condition, accessories, anything worth remembering"
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </Field>
        </div>
      </FormSection>
      {/* Lets Enter submit even though the visible button lives in the dialog footer. */}
      <button type="submit" hidden aria-hidden tabIndex={-1} />
    </form>
  )
}

function fieldId(formId: string, path: string): string {
  return `${formId}-${path.replace(/\./g, "-")}`
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3.5">
      <legend className="mb-3.5 text-xs font-medium tracking-wide text-faint uppercase">{title}</legend>
      {children}
    </fieldset>
  )
}
