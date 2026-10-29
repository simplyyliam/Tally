import { createContext, useContext, type ReactNode } from "react"
import { useLoans } from "@/features/loans"
import { todayIso } from "@/shared/lib/dates"
import { useLiveData } from "@/shared/lib/use-live-data"
import { deriveBorrowers, type Borrower } from "../domain/borrower"
import type { BorrowerRepository } from "./borrower-repository"

const BorrowerRepositoryContext = createContext<BorrowerRepository | null>(null)

export function BorrowerRepositoryProvider({ repository, children }: { repository: BorrowerRepository; children: ReactNode }) {
  return <BorrowerRepositoryContext.Provider value={repository}>{children}</BorrowerRepositoryContext.Provider>
}

export function useBorrowerRepository(): BorrowerRepository {
  const repository = useContext(BorrowerRepositoryContext)
  if (!repository) throw new Error("useBorrowerRepository must be used inside BorrowerRepositoryProvider")
  return repository
}

/** Every borrower, worked out from the loans. */
export function useBorrowers(): { borrowers: Borrower[]; loading: boolean } {
  const { data: loans, loading } = useLoans()
  return { borrowers: loans ? deriveBorrowers(loans, todayIso()) : [], loading }
}

/** Looks up whether a borrower agreed to WhatsApp contact (default: yes). */
export function useWhatsappConsent(): (key: string) => boolean {
  const repository = useBorrowerRepository()
  const { data: preferences = [] } = useLiveData(repository, (source) => source.listPreferences())
  return (key) => preferences.find((preference) => preference.key === key)?.whatsappConsent ?? true
}
