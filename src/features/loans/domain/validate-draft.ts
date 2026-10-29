import { isValidPhone } from "@/shared/lib/phone"
import { loanDraftSchema, type LoanDraft } from "./loan"

/** Field path ("borrower.name", "lines.0.quantity") -> message. */
export type DraftErrors = Record<string, string>

/**
 * Checks a loan before it is saved. On top of the schema, phone numbers must
 * be usable when given, because a wrong number means the reminder never arrives.
 * Stored data is not held to this rule, so older records with odd numbers still load.
 */
export function validateDraft(input: LoanDraft): { ok: true; draft: LoanDraft } | { ok: false; errors: DraftErrors } {
  const errors: DraftErrors = {}
  const result = loanDraftSchema.safeParse(input)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join(".")
      errors[path] ??= issue.message
    }
  }
  if (input.borrower.cellphone.trim() && !isValidPhone(input.borrower.cellphone)) {
    errors["borrower.cellphone"] = "Use a number like 082 123 4567"
  }
  if (input.borrower.whatsapp.trim() && !isValidPhone(input.borrower.whatsapp)) {
    errors["borrower.whatsapp"] = "Use a number like 082 123 4567"
  }
  if (Object.keys(errors).length > 0 || !result.success) return { ok: false, errors }
  return { ok: true, draft: result.data }
}
