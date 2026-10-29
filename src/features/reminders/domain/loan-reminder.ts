import { formatDate, type IsoDate } from "@/shared/lib/dates"
import { outstandingLines, overdueDays, type Loan } from "@/features/loans"
import { renderTemplate, type TemplateValues } from "./template"

/** Fills the template placeholders from a loan. Only items still out are listed. */
export function reminderValuesForLoan(loan: Loan, today: IsoDate): TemplateValues {
  const lines = outstandingLines(loan)
  return {
    name: loan.borrower.name.split(/\s+/)[0] ?? loan.borrower.name,
    items: lines.map((line) => `- ${line.quantity - line.quantityReturned} × ${line.description}`).join("\n"),
    dueDate: formatDate(loan.expectedReturnDate),
    daysOverdue: String(overdueDays(loan, today)),
    reference: loan.reference,
  }
}

export function reminderTextForLoan(loan: Loan, template: string, today: IsoDate): string {
  return renderTemplate(template, reminderValuesForLoan(loan, today))
}

/** The number to message: the WhatsApp number if given, otherwise the cellphone. */
export function reminderPhoneForLoan(loan: Loan): string {
  return loan.borrower.whatsapp || loan.borrower.cellphone
}
