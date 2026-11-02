// The public face of the borrowers feature. Other code imports only from here.
export {
  borrowerKey,
  borrowerPreferenceSchema,
  deriveBorrowers,
  findBorrower,
  suggestBorrowers,
  type Borrower,
  type BorrowerPreference,
  type OutstandingItem,
} from "./domain/borrower"
export type { BorrowerRepository } from "./data/borrower-repository"
export { LocalBorrowerRepository } from "./data/local-borrower-repository"
export { WhatsappConsentField } from "./ui/whatsapp-consent-field"
export { BorrowerRepositoryProvider, useBorrowerRepository, useBorrowers, useWhatsappConsent } from "./data/borrower-context"
