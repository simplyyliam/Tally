import { normalizePhone } from "@/shared/lib/phone"
import type { ReminderChannel, ReminderMessage, ReminderResult } from "../domain/reminder-channel"

/** Builds the https://wa.me link that opens WhatsApp with the message ready to send. */
export function waMeUrl(message: ReminderMessage): string | null {
  const phone = normalizePhone(message.phone)
  if (!phone) return null
  return `https://wa.me/${phone}?text=${encodeURIComponent(message.text)}`
}

/** Free and manual: opens WhatsApp (app or web) and the staff member presses send. */
export class WaMeChannel implements ReminderChannel {
  readonly id = "wa-me"
  readonly label = "WhatsApp"

  unavailableReason(message: ReminderMessage): string | null {
    if (!message.phone.trim()) return "No phone number on this loan"
    if (!normalizePhone(message.phone)) return "The phone number doesn't look right"
    return null
  }

  async send(message: ReminderMessage): Promise<ReminderResult> {
    const url = waMeUrl(message)
    if (!url) return { ok: false, reason: this.unavailableReason(message) ?? "Can't open WhatsApp" }
    window.open(url, "_blank", "noopener,noreferrer")
    return { ok: true }
  }
}
