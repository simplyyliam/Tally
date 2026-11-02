import type { LocalDocumentStore } from "@/shared/schema/local-document"
import { DEFAULT_SETTINGS, settingsSchema, type Settings } from "../domain/settings"
import type { SettingsRepository } from "./settings-repository"

const SECTION = "settings"

export class LocalSettingsRepository implements SettingsRepository {
  private readonly store: LocalDocumentStore

  constructor(store: LocalDocumentStore) {
    this.store = store
  }

  async get(): Promise<Settings> {
    const result = settingsSchema.safeParse(this.store.getSection(SECTION) ?? {})
    // A damaged settings block falls back to defaults rather than blocking the app.
    return result.success ? result.data : DEFAULT_SETTINGS
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const next = settingsSchema.parse({ ...(await this.get()), ...patch })
    this.store.setSection(SECTION, next)
    return next
  }

  subscribe(onChange: () => void): () => void {
    return this.store.subscribe(onChange)
  }
}
