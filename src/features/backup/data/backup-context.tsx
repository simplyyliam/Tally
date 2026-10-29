import { createContext, useContext, type ReactNode } from "react"
import { useLiveData } from "@/shared/lib/use-live-data"
import type { BackupRepository } from "./backup-repository"

const BackupRepositoryContext = createContext<BackupRepository | null>(null)

export function BackupRepositoryProvider({ repository, children }: { repository: BackupRepository; children: ReactNode }) {
  return <BackupRepositoryContext.Provider value={repository}>{children}</BackupRepositoryContext.Provider>
}

export function useBackupRepository(): BackupRepository {
  const repository = useContext(BackupRepositoryContext)
  if (!repository) throw new Error("useBackupRepository must be used inside BackupRepositoryProvider")
  return repository
}

export function useLastBackupAt(): { lastBackupAt: string | undefined; loading: boolean } {
  const repository = useBackupRepository()
  const { data, loading } = useLiveData(repository, (source) => source.lastBackupAt())
  return { lastBackupAt: data, loading }
}
