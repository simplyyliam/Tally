import { z } from "zod"

/** Preferences for this register. Every field has a default so older data always loads. */
export const settingsSchema = z.object({
  /** Pre-fills "Issued by" on new loans. */
  staffName: z.string().trim().default(""),
})

export type Settings = z.infer<typeof settingsSchema>

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({})
