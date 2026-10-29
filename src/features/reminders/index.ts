// The public face of the reminders feature. Other code imports only from here.
export type { ReminderChannel, ReminderMessage, ReminderResult } from "./domain/reminder-channel"
export {
  DEFAULT_REMINDER_TEMPLATE,
  TEMPLATE_PLACEHOLDERS,
  renderTemplate,
  unknownPlaceholders,
  type TemplatePlaceholder,
  type TemplateValues,
} from "./domain/template"
export { reminderPhoneForLoan, reminderTextForLoan, reminderValuesForLoan } from "./domain/loan-reminder"
export { WaMeChannel, waMeUrl } from "./data/wa-me-channel"
export { ReminderChannelProvider, useReminderChannel } from "./data/reminder-channel-context"
export { WhatsAppButton } from "./ui/whatsapp-button"
