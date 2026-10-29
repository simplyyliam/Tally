import { createContext, useContext, type ReactNode } from "react"
import { useLiveData } from "@/shared/lib/use-live-data"
import { DEFAULT_SETTINGS } from "../domain/settings"
import type { SettingsRepository } from "./settings-repository"

const SettingsRepositoryContext = createContext<SettingsRepository | null>(null)

export function SettingsRepositoryProvider({ repository, children }: { repository: SettingsRepository; children: ReactNode }) {
  return <SettingsRepositoryContext.Provider value={repository}>{children}</SettingsRepositoryContext.Provider>
}

export function useSettingsRepository(): SettingsRepository {
  const repository = useContext(SettingsRepositoryContext)
  if (!repository) throw new Error("useSettingsRepository must be used inside SettingsRepositoryProvider")
  return repository
}

export function useSettings() {
  const repository = useSettingsRepository()
  const live = useLiveData(repository, (source) => source.get())
  return live.data ?? DEFAULT_SETTINGS
}
