import { useState } from "react"
import { Download, Settings } from "lucide-react"
import { loansToCsvRows, useLoans } from "@/features/loans"
import { useSettings, useSettingsRepository } from "@/features/settings"
import { toCsv } from "@/shared/lib/csv"
import { fileDateStamp, todayIso } from "@/shared/lib/dates"
import { downloadTextFile } from "@/shared/lib/download"
import { Button } from "@/shared/ui/button"
import { Panel } from "@/shared/ui/card"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { PageHeader } from "@/shared/ui/page-header"
import { useToast } from "@/shared/ui/toast"

/** Preferences and data tools. Each feature contributes a section. */
export function SettingsPage() {
  const settings = useSettings()
  const repository = useSettingsRepository()
  const { data: loans = [] } = useLoans()
  const toast = useToast()
  const [staffName, setStaffName] = useState<string | null>(null)

  return (
    <>
      <PageHeader icon={<Settings />} title="Settings" breadcrumbs={[{ label: "Dashboard", to: "/" }]} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <Panel title="You" description="Who is using this register on this device">
          <form
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
            onSubmit={async (event) => {
              event.preventDefault()
              await repository.update({ staffName: staffName ?? settings.staffName })
              setStaffName(null)
              toast("Saved")
            }}
          >
            <Field label="Your name" htmlFor="staff-name" hint="Fills in “Issued by” on new loans" className="flex-1">
              <Input id="staff-name" value={staffName ?? settings.staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="e.g. Liam" />
            </Field>
            <Button type="submit" variant="primary" disabled={staffName === null || staffName === settings.staffName}>
              Save
            </Button>
          </form>
        </Panel>

        <Panel title="Export" description="A spreadsheet of every loan, one row per item">
          <div className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm text-muted-foreground">Opens in Excel or Google Sheets.</p>
            <Button
              disabled={loans.length === 0}
              onClick={() =>
                downloadTextFile(`tally-loans-${fileDateStamp()}.csv`, toCsv(loansToCsvRows(loans, todayIso())), "text/csv;charset=utf-8")
              }
            >
              <Download />
              Export CSV
            </Button>
          </div>
        </Panel>
      </div>
    </>
  )
}
