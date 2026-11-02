// The public face of the settings feature. Other code imports only from here.
export { DEFAULT_SETTINGS, settingsSchema, type Settings } from "./domain/settings"
export type { SettingsRepository } from "./data/settings-repository"
export { LocalSettingsRepository } from "./data/local-settings-repository"
export { SettingsRepositoryProvider, useSettings, useSettingsRepository } from "./data/settings-context"
