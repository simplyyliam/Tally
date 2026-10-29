import type { ReactNode } from "react"
import { LoanActionsProvider, LoanEditorStateProvider, LoanRepositoryProvider } from "@/features/loans"
import { BackupRepositoryProvider } from "@/features/backup"
import { BorrowerRepositoryProvider } from "@/features/borrowers"
import { SettingsRepositoryProvider } from "@/features/settings"
import { ReminderChannelProvider } from "@/features/reminders"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import type { Repositories } from "./repositories"

export function Providers({ repositories, children }: { repositories: Repositories; children: ReactNode }) {
  return (
    <TooltipProvider>
      <BackupRepositoryProvider repository={repositories.backup}>
      <SettingsRepositoryProvider repository={repositories.settings}>
        <LoanRepositoryProvider repository={repositories.loans}>
          <BorrowerRepositoryProvider repository={repositories.borrowers}>
            <ReminderChannelProvider channel={repositories.reminderChannel}>
              <LoanEditorStateProvider>
                <LoanActionsProvider>{children}</LoanActionsProvider>
              </LoanEditorStateProvider>
            </ReminderChannelProvider>
          </BorrowerRepositoryProvider>
        </LoanRepositoryProvider>
      </SettingsRepositoryProvider>
      </BackupRepositoryProvider>
      <Toaster position="bottom-center" mobileOffset={{ bottom: 92 }} />
    </TooltipProvider>
  )
}
