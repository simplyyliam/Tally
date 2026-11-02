import { FileSpreadsheet } from "lucide-react"
import { ImportPanel } from "@/features/import"
import { PageHeader } from "@/shared/ui/page-header"

/** Bringing an existing Excel or CSV register into Tally. */
export function ImportPage() {
  return (
    <>
      <PageHeader icon={<FileSpreadsheet />} title="Import" breadcrumbs={[{ label: "Dashboard", to: "/" }]} />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <ImportPanel />
      </div>
    </>
  )
}
