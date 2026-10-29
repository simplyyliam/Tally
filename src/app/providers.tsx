import type { ReactNode } from "react"
import { LoanActionsProvider, LoanEditorStateProvider, LoanRepositoryProvider } from "@/features/loans"
import { SettingsRepositoryProvider } from "@/features/settings"
import { ReminderChannelProvider } from "@/features/reminders"
import { ToastProvider } from "@/shared/ui/toast"
import type { Repositories } from "./repositories"

export function Providers({ repositories, children }: { repositories: Repositories; children: ReactNode }) {
  return (
    <ToastProvider>
      <SettingsRepositoryProvider repository={repositories.settings}>
        <LoanRepositoryProvider repository={repositories.loans}>
          <ReminderChannelProvider channel={repositories.reminderChannel}>
            <LoanEditorStateProvider>
              <LoanActionsProvider>{children}</LoanActionsProvider>
            </LoanEditorStateProvider>
          </ReminderChannelProvider>
        </LoanRepositoryProvider>
      </SettingsRepositoryProvider>
    </ToastProvider>
  )
}
