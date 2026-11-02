import { borrowerKey, useWhatsappConsent } from "@/features/borrowers"
import type { Loan } from "@/features/loans"
import type { IsoDate } from "@/shared/lib/dates"
import { reminderPhoneForLoan, reminderTextForLoan } from "../domain/loan-reminder"
import { useReminderTemplate } from "../data/use-reminder-template"
import { WhatsAppButton, type WhatsAppButtonProps } from "./whatsapp-button"

type LoanWhatsAppButtonProps = Omit<WhatsAppButtonProps, "phone" | "text" | "blockedReason"> & {
  loan: Loan
  today: IsoDate
}

/**
 * The reminder button for one loan: the Settings template filled in, sent to
 * the borrower's WhatsApp number, and disabled if they opted out (POPIA).
 */
export function LoanWhatsAppButton({ loan, today, ...props }: LoanWhatsAppButtonProps) {
  const template = useReminderTemplate()
  const hasConsent = useWhatsappConsent()
  const firstName = loan.borrower.name.split(/\s+/)[0] || "This borrower"
  return (
    <WhatsAppButton
      {...props}
      phone={reminderPhoneForLoan(loan)}
      text={reminderTextForLoan(loan, template, today)}
      blockedReason={hasConsent(borrowerKey(loan.borrower)) ? undefined : `${firstName} asked not to be contacted on WhatsApp`}
    />
  )
}
