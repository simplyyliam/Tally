import type { Settings } from "../domain/settings"

export interface SettingsRepository {
  get(): Promise<Settings>
  update(patch: Partial<Settings>): Promise<Settings>
  subscribe(onChange: () => void): () => void
}
