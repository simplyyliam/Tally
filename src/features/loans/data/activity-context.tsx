import { createContext, useContext, type ReactNode } from "react"
import { useLiveData } from "@/shared/lib/use-live-data"
import type { ActivityRepository } from "./activity-repository"

const ActivityRepositoryContext = createContext<ActivityRepository | null>(null)

export function ActivityRepositoryProvider({ repository, children }: { repository: ActivityRepository; children: ReactNode }) {
  return <ActivityRepositoryContext.Provider value={repository}>{children}</ActivityRepositoryContext.Provider>
}

export function useActivityRepository(): ActivityRepository {
  const repository = useContext(ActivityRepositoryContext)
  if (!repository) throw new Error("useActivityRepository must be used inside ActivityRepositoryProvider")
  return repository
}

export function useActivity() {
  const repository = useActivityRepository()
  return useLiveData(repository, (source) => source.list())
}
