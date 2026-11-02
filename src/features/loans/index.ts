// The public face of the loans feature. Other features and widgets import only from here.

// Domain: types, schemas and rules (pure, no React, no storage)
export {
  borrowerDetailsSchema,
  loanDraftSchema,
  loanLineSchema,
  loanSchema,
  type BorrowerDetails,
  type Loan,
  type LoanDraft,
  type LoanLine,
} from "./domain/loan"
export {
  STATUS_LABELS,
  describeLines,
  isDueTomorrow,
  isExtended,
  isFullyReturned,
  isLineReturned,
  isPartlyReturned,
  lineStatus,
  loanStatus,
  outstandingLines,
  outstandingQuantity,
  overdueDays,
  remainingQuantity,
  totalQuantity,
  type LoanStatus,
} from "./domain/status"
export { LoanChangeError, createLoan, draftFromLoan, editLoan, extendLoan, returnAllItems, returnLines, type ChangeContext } from "./domain/changes"
export { LOAN_SORTS, LOAN_TABS, countByTab, matchesSearch, matchesTab, sortLoans, type LoanSort, type LoanTab } from "./domain/list-view"
export { EXPORT_HEADERS, loansToCsvRows } from "./domain/export"
export { validateDraft, type DraftErrors } from "./domain/validate-draft"
export { loansToPurge, retentionCutoff } from "./domain/retention"
export {
  ACTIVITY_KINDS,
  ACTIVITY_LABELS,
  activityEntrySchema,
  activityFor,
  describeExtension,
  describeIssue,
  describeReturn,
  sortActivity,
  type ActivityDraft,
  type ActivityEntry,
  type ActivityKind,
} from "./domain/activity"

// Data: the repository interface, the local implementation and hooks
export type { LoanRepository } from "./data/loan-repository"
export { LocalLoanRepository } from "./data/local-loan-repository"
export { LoanRepositoryProvider, useLoanRepository, useLoans } from "./data/loan-repository-context"
export type { ActivityRepository } from "./data/activity-repository"
export { LocalActivityRepository } from "./data/local-activity-repository"
export { ActivityRepositoryProvider, useActivity, useActivityRepository } from "./data/activity-context"

// UI
export { LoanForm, type BorrowerSuggestion } from "./ui/loan-form"
export { LoanList, ReturnButton } from "./ui/loan-list"
export { BorrowerName, ItemsSummary } from "./ui/loan-bits"
export { ExtensionMark, LoanStatusPill } from "./ui/status-pill"
export { LoanActionsProvider, useLoanActions } from "./ui/loan-actions-context"
export { LoanEditorStateProvider, useLoanEditor, type LoanEditorState } from "./ui/loan-editor-context"
export { ActivityIcon } from "./ui/activity-icon"
