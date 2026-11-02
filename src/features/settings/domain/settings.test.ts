import { describe, expect, it } from "vitest"
import { settingsSchema } from "./settings"

describe("settings", () => {
  it("settings saved before the reminder template existed still load, with the built-in text", () => {
    expect(settingsSchema.parse({ staffName: "Liam" })).toEqual({ staffName: "Liam", reminderTemplate: "" })
  })

  it("keeps a custom reminder template exactly as typed", () => {
    expect(settingsSchema.parse({ reminderTemplate: "Hi {name}\n" }).reminderTemplate).toBe("Hi {name}\n")
  })
})
