import { createContext, useContext, useState, type ReactNode } from "react"
import type { BorrowerDetails } from "../domain/loan"

export type LoanEditorState =
  | { mode: "closed" }
  | { mode: "new"; borrower?: BorrowerDetails }
  | { mode: "edit"; loanId: string }

interface LoanEditor {
  state: LoanEditorState
  openNew: (borrower?: BorrowerDetails) => void
  openEdit: (loanId: string) => void
  close: () => void
}

const LoanEditorContext = createContext<LoanEditor | null>(null)

/**
 * Which loan form is open. Any screen can call openNew(); the dialog itself is
 * drawn once by the loan-editor widget, which also wires in borrower suggestions.
 */
export function LoanEditorStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoanEditorState>({ mode: "closed" })
  const editor: LoanEditor = {
    state,
    openNew: (borrower) => setState({ mode: "new", borrower }),
    openEdit: (loanId) => setState({ mode: "edit", loanId }),
    close: () => setState({ mode: "closed" }),
  }
  return <LoanEditorContext.Provider value={editor}>{children}</LoanEditorContext.Provider>
}

export function useLoanEditor(): LoanEditor {
  const editor = useContext(LoanEditorContext)
  if (!editor) throw new Error("useLoanEditor must be used inside LoanEditorStateProvider")
  return editor
}
