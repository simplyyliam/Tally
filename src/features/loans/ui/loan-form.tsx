import { useState, type FormEvent, type ReactNode } from "react"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/shared/ui/date-picker"
import { formatPhone } from "@/shared/lib/phone"
import type { BorrowerDetails, LoanDraft } from "../domain/loan"
import { validateDraft, type DraftErrors } from "../domain/validate-draft"
import { BorrowerNameField } from "./borrower-name-field"
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
  const invalid = (path: string) => (errors[path] ? true : undefined)
  const describedBy = (path: string) => (errors[path] ? `${id(path)}-error` : undefined)
  const errorText = (path: string) => errors[path] && <FieldError id={`${id(path)}-error`}>{errors[path]}</FieldError>

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend variant="label" className="text-xs tracking-wide text-muted-foreground uppercase">
          Borrower
        </FieldLegend>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={invalid("borrower.name")} className="md:col-span-2">
            <FieldLabel htmlFor={id("borrower.name")}>Name</FieldLabel>
            <BorrowerNameField
              id={id("borrower.name")}
              value={draft.borrower.name}
              suggestions={suggestions}
              invalid={invalid("borrower.name")}
              describedBy={describedBy("borrower.name")}
              onValueChange={(name) => update({ ...draft, borrower: { ...draft.borrower, name } })}
              onPick={(picked) => {
                update({ ...draft, borrower: { ...picked.details } })
                onBorrowerPicked?.(picked)
              }}
            />
            {errorText("borrower.name")}
          </Field>
          <Field data-invalid={invalid("borrower.cellphone")}>
            <FieldLabel htmlFor={id("borrower.cellphone")}>Cellphone</FieldLabel>
            <Input
              id={id("borrower.cellphone")}
              type="tel"
              inputMode="tel"
              placeholder="082 123 4567"
              value={draft.borrower.cellphone}
              aria-invalid={invalid("borrower.cellphone")}
              aria-describedby={describedBy("borrower.cellphone")}
              onChange={(event) => setBorrower({ cellphone: event.target.value })}
              onBlur={() => draft.borrower.cellphone && setBorrower({ cellphone: formatPhone(draft.borrower.cellphone) })}
            />
            {errorText("borrower.cellphone")}
          </Field>
          <Field data-invalid={invalid("borrower.whatsapp")}>
            <FieldLabel htmlFor={id("borrower.whatsapp")}>
              WhatsApp <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id={id("borrower.whatsapp")}
              type="tel"
              inputMode="tel"
              placeholder="Same as cellphone"
              value={draft.borrower.whatsapp}
              aria-invalid={invalid("borrower.whatsapp")}
              aria-describedby={describedBy("borrower.whatsapp")}
              onChange={(event) => setBorrower({ whatsapp: event.target.value })}
              onBlur={() => draft.borrower.whatsapp && setBorrower({ whatsapp: formatPhone(draft.borrower.whatsapp) })}
            />
            {errorText("borrower.whatsapp") || <FieldDescription>Leave empty if it's the same as the cellphone</FieldDescription>}
          </Field>
          <Field>
            <FieldLabel htmlFor={id("borrower.department")}>
              Section or department <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id={id("borrower.department")}
              placeholder="e.g. Maintenance"
              value={draft.borrower.department}
              onChange={(event) => setBorrower({ department: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={id("borrower.employeeNumber")}>
              Employee / work number <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id={id("borrower.employeeNumber")}
              placeholder="e.g. E1042"
              value={draft.borrower.employeeNumber}
              onChange={(event) => setBorrower({ employeeNumber: event.target.value })}
            />
          </Field>
        </FieldGroup>
        {borrowerExtra?.(draft.borrower)}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label" className="text-xs tracking-wide text-muted-foreground uppercase">
          Items
        </FieldLegend>
        <LineItemsEditor formId={formId} lines={draft.lines} errors={errors} onChange={(lines) => update({ ...draft, lines })} />
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label" className="text-xs tracking-wide text-muted-foreground uppercase">
          Dates
        </FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={invalid("startDate")}>
            <FieldLabel htmlFor={id("startDate")}>Start date</FieldLabel>
            <DatePicker id={id("startDate")} value={draft.startDate} onChange={(startDate) => update({ ...draft, startDate })} invalid={invalid("startDate")} />
            {errorText("startDate")}
          </Field>
          <Field data-invalid={invalid("expectedReturnDate")}>
            <FieldLabel htmlFor={id("expectedReturnDate")}>Expected return date</FieldLabel>
            <DatePicker
              id={id("expectedReturnDate")}
              min={draft.startDate}
              value={draft.expectedReturnDate}
              onChange={(expectedReturnDate) => update({ ...draft, expectedReturnDate })}
              invalid={invalid("expectedReturnDate")}
              describedBy={describedBy("expectedReturnDate")}
            />
            {errorText("expectedReturnDate")}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label" className="text-xs tracking-wide text-muted-foreground uppercase">
          Details
        </FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={id("issuedBy")}>Issued by</FieldLabel>
            <Input id={id("issuedBy")} placeholder="Your name" value={draft.issuedBy} onChange={(event) => setDraft({ ...draft, issuedBy: event.target.value })} />
            <FieldDescription>The staff member handing the items over</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={id("notes")}>
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id={id("notes")}
              rows={2}
              placeholder="Condition, accessories, anything worth remembering"
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      {/* Lets Enter submit even though the visible button lives in the dialog footer. */}
      <button type="submit" hidden aria-hidden tabIndex={-1} />
    </form>
  )
}

function fieldId(formId: string, path: string): string {
  return `${formId}-${path.replace(/\./g, "-")}`
}
