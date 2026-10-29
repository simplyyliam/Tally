/**
 * A way of reaching a borrower. v1.0 has one: a wa.me link that opens WhatsApp
 * with the message typed in, and a person presses send. v1.2 adds the WhatsApp
 * Cloud API and email as further implementations of this same interface.
 */
export interface ReminderMessage {
  /** The borrower's number as typed; each channel normalises it. */
  phone: string
  text: string
}

export type ReminderResult = { ok: true } | { ok: false; reason: string }

export interface ReminderChannel {
  readonly id: string
  readonly label: string
  /** Why this message can't go out on this channel, or null when it can. */
  unavailableReason(message: ReminderMessage): string | null
  send(message: ReminderMessage): Promise<ReminderResult>
}
