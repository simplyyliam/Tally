import { useSettings } from "@/features/settings"
import { DEFAULT_REMINDER_TEMPLATE } from "../domain/template"

/** The reminder text staff chose in Settings, or the built-in one if they never changed it. */
export function useReminderTemplate(): string {
  const { reminderTemplate } = useSettings()
  return reminderTemplate.trim() ? reminderTemplate : DEFAULT_REMINDER_TEMPLATE
}
