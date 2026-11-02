import type { Loan, LoanDraft } from "../domain/loan"

/**
 * Everything the app may ask of loan storage. Screens only ever see this
 * interface; src/app chooses the implementation (local now, online in v1.1).
 */
export interface LoanRepository {
  list(): Promise<Loan[]>
  get(id: string): Promise<Loan | undefined>
  create(draft: LoanDraft): Promise<Loan>
  createMany(drafts: ReadonlyArray<LoanDraft>): Promise<Loan[]>
  /** Saves a loan produced by one of the pure functions in domain/changes. */
  save(loan: Loan): Promise<void>
  saveMany(loans: ReadonlyArray<Loan>): Promise<void>
  remove(ids: ReadonlyArray<string>): Promise<void>
  subscribe(onChange: () => void): () => void
}
