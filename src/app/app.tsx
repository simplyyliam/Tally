import { HashRouter, Route, Routes } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { BackupBanner } from "@/features/backup"
import { BackupPage } from "@/widgets/backup-page/backup-page"
import { BorrowerProfile } from "@/widgets/borrower-profile/borrower-profile"
import { BorrowersPage } from "@/widgets/borrowers-page/borrowers-page"
import { Dashboard } from "@/widgets/dashboard/dashboard"
import { ImportPage } from "@/widgets/import-page/import-page"
import { LoanDetail } from "@/widgets/loan-detail/loan-detail"
import { LoanEditor } from "@/widgets/loan-editor/loan-editor"
import { LoansRegister } from "@/widgets/loans-register/loans-register"
import { SettingsPage } from "@/widgets/settings-page/settings-page"
import { Providers } from "./providers"
import type { Repositories } from "./repositories"

/**
 * Hash routing (#/loans) keeps every page working when the app is opened as a
 * downloaded file or served from any folder, with no server rewrite rules.
 */
export function App({ repositories }: { repositories: Repositories }) {
  return (
    <Providers repositories={repositories}>
      <HashRouter>
        <AppShell
          banner={
            repositories.store.readOnlyReason ? (
              <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
                <ShieldAlert />
                <AlertDescription>{repositories.store.readOnlyReason}</AlertDescription>
              </Alert>
            ) : (
              <BackupBanner />
            )
          }
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/loans" element={<LoansRegister />} />
            <Route path="/loans/:loanId" element={<LoanDetail />} />
            <Route path="/borrowers" element={<BorrowersPage />} />
            <Route path="/borrowers/:borrowerKey" element={<BorrowerProfile />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AppShell>
        <LoanEditor />
      </HashRouter>
    </Providers>
  )
}
