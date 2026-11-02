import { useState } from "react"
import { Download, Settings } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loansToCsvRows, useLoans } from "@/features/loans"
import { DemoDataCard } from "@/features/demo"
import { ReminderTemplateCard } from "@/features/reminders"
import { useSettings, useSettingsRepository } from "@/features/settings"
import { toCsv } from "@/shared/lib/csv"
import { fileDateStamp, todayIso } from "@/shared/lib/dates"
import { downloadTextFile } from "@/shared/lib/download"
import { PageHeader } from "@/shared/ui/page-header"
import { RetentionCard } from "./retention-card"

/** Preferences and data tools, one shadcn Card per topic. */
export function SettingsPage() {
  const settings = useSettings()
  const repository = useSettingsRepository()
  const { data: loans = [] } = useLoans()
  const [staffName, setStaffName] = useState<string | null>(null)

  return (
    <>
      <PageHeader icon={<Settings />} title="Settings" breadcrumbs={[{ label: "Dashboard", to: "/" }]} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <Card className="rounded-2xl shadow-none ring-border">
          <CardHeader>
            <CardTitle>You</CardTitle>
            <CardDescription>Who is using this register on this device</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="staff-form"
              onSubmit={async (event) => {
                event.preventDefault()
                await repository.update({ staffName: staffName ?? settings.staffName })
                setStaffName(null)
                toast.success("Saved")
              }}
            >
              <Field>
                <FieldLabel htmlFor="staff-name">Your name</FieldLabel>
                <Input id="staff-name" value={staffName ?? settings.staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="e.g. Liam" />
                <FieldDescription>Fills in “Issued by” on new loans</FieldDescription>
              </Field>
            </form>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" form="staff-form" disabled={staffName === null || staffName === settings.staffName}>
              Save
            </Button>
          </CardFooter>
        </Card>

        <ReminderTemplateCard />

        <Card className="rounded-2xl shadow-none ring-border">
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>A spreadsheet of every loan, one row per item. Opens in Excel or Google Sheets.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button
              variant="outline"
              disabled={loans.length === 0}
              onClick={() => downloadTextFile(`tally-loans-${fileDateStamp()}.csv`, toCsv(loansToCsvRows(loans, todayIso())), "text/csv;charset=utf-8")}
            >
              <Download data-icon="inline-start" />
              Export CSV
            </Button>
          </CardFooter>
        </Card>
        <RetentionCard />
        <DemoDataCard />
      </div>
    </>
  )
}
