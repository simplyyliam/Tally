import { Database } from "lucide-react"
import { BackupPanel } from "@/features/backup"
import { PageHeader } from "@/shared/ui/page-header"

/** Backup and restore, in their own place so they're easy to find. */
export function BackupPage() {
  return (
    <>
      <PageHeader icon={<Database />} title="Backup & restore" breadcrumbs={[{ label: "Dashboard", to: "/" }]} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <BackupPanel />
      </div>
    </>
  )
}
