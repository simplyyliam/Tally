import { HashRouter, Route, Routes } from "react-router-dom"
import { AppShell } from "@/widgets/app-shell/app-shell"
import { Dashboard } from "@/widgets/dashboard/dashboard"
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
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/loans" element={<LoansRegister />} />
            <Route path="/loans/:loanId" element={<LoanDetail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </AppShell>
        <LoanEditor />
      </HashRouter>
    </Providers>
  )
}
