import { z } from "zod"

/** Preferences for this register. Every field has a default so older data always loads. */
export const settingsSchema = z.object({
  /** Pre-fills "Issued by" on new loans. */
  staffName: z.string().trim().default(""),
  /**
   * The WhatsApp reminder text with {placeholders}. Empty means "use the
   * built-in text": the reminders feature owns that default, so settings
   * never has to import it, and an improved default reaches everyone who
   * never customised theirs.
   */
  reminderTemplate: z.string().default(""),
})

export type Settings = z.infer<typeof settingsSchema>

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({})
