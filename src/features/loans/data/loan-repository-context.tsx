import { createContext, useContext, type ReactNode } from "react"
import { useLiveData } from "@/shared/lib/use-live-data"
import type { LoanRepository } from "./loan-repository"

const LoanRepositoryContext = createContext<LoanRepository | null>(null)

/** src/app passes in the chosen implementation; screens just call useLoans(). */
export function LoanRepositoryProvider({ repository, children }: { repository: LoanRepository; children: ReactNode }) {
  return <LoanRepositoryContext.Provider value={repository}>{children}</LoanRepositoryContext.Provider>
}

export function useLoanRepository(): LoanRepository {
  const repository = useContext(LoanRepositoryContext)
  if (!repository) throw new Error("useLoanRepository must be used inside LoanRepositoryProvider")
  return repository
}

export function useLoans() {
  const repository = useLoanRepository()
  return useLiveData(repository, (source) => source.list())
}
