import type { BorrowerPreference } from "../domain/borrower"

/**
 * Per-borrower settings that don't belong to any one loan (for now, WhatsApp
 * consent). The borrowers themselves are derived from loans.
 */
export interface BorrowerRepository {
  listPreferences(): Promise<BorrowerPreference[]>
  setWhatsappConsent(key: string, consent: boolean): Promise<void>
  /** Removes preferences for borrowers that no longer have any loans (data retention). */
  removePreferences(keys: ReadonlyArray<string>): Promise<void>
  subscribe(onChange: () => void): () => void
}
