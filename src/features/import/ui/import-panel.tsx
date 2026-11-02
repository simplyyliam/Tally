import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CircleCheck, FileSpreadsheet, FileUp } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useLoanRepository } from "@/features/loans"
import { nowTimestamp, todayIso } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import { buildImport, type ImportPlan } from "../domain/build-import"
import { guessMapping, missingRequiredFields, type ColumnMapping } from "../domain/import-fields"
import { readSpreadsheet } from "../data/read-spreadsheet"
import { saveImport } from "../data/save-import"
import { ColumnMappingCard } from "./column-mapping-card"
import { ImportPreviewCard } from "./import-preview-card"
import { RowReport } from "./row-report"

type Step =
  | { kind: "choose" }
  | { kind: "map"; fileName: string; headers: string[]; rows: string[][]; mapping: ColumnMapping }
  | { kind: "done"; imported: number; plan: ImportPlan }

/** Choose a file → match columns with a preview → import → see what was skipped. */
export function ImportPanel() {
  const repository = useLoanRepository()
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>({ kind: "choose" })
  const [busy, setBusy] = useState(false)

  const readFile = async (file: File) => {
    setBusy(true)
    try {
      const [headers = [], ...rows] = await readSpreadsheet(file)
      if (rows.length === 0) throw new Error("That file has no rows under the header row.")
      setStep({ kind: "map", fileName: file.name, headers, rows, mapping: guessMapping(headers) })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't read that file")
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  const picker = (
    <input
      ref={fileInput}
      type="file"
      accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      className="sr-only"
      aria-label="Spreadsheet file"
      onChange={(event) => {
        const file = event.target.files?.[0]
        if (file) void readFile(file)
      }}
    />
  )

  if (step.kind === "choose") {
    return (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSpreadsheet />
          </EmptyMedia>
          <EmptyTitle>Import a register</EmptyTitle>
          <EmptyDescription>
            Bring in loans from Excel (.xlsx) or a CSV file. The first row should hold the column names. You'll see a preview before anything is
            saved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {picker}
          <Button disabled={busy} onClick={() => fileInput.current?.click()}>
            {busy ? <Spinner data-icon="inline-start" /> : <FileUp data-icon="inline-start" />}
            {busy ? "Reading file…" : "Choose file"}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (step.kind === "done") {
    return (
      <div className="flex flex-col gap-6">
        <Alert role="status" className="border-green-text/15 bg-green-tint text-green-text">
          <CircleCheck />
          <AlertDescription className="text-green-text">
            Imported {plural(step.imported, "loan")}
            {step.plan.skipped.length > 0 && `; ${plural(step.plan.skipped.length, "row")} skipped`}.
          </AlertDescription>
        </Alert>
        <RowReport plan={step.plan} />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setStep({ kind: "choose" })}>
            Import another file
          </Button>
          <Button onClick={() => navigate("/loans")}>View loans</Button>
        </div>
      </div>
    )
  }

  const plan = buildImport(step.rows, step.mapping, todayIso())
  const missing = missingRequiredFields(step.mapping)

  const runImport = async () => {
    setBusy(true)
    try {
      const saved = await saveImport(repository, plan.loans, nowTimestamp())
      setStep({ kind: "done", imported: saved.length, plan })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ColumnMappingCard headers={step.headers} mapping={step.mapping} onChange={(mapping) => setStep({ ...step, mapping })} />
      {missing.length === 0 && <ImportPreviewCard rows={step.rows} mapping={step.mapping} plan={plan} />}
      {missing.length === 0 && <RowReport plan={plan} />}
      <Card className="rounded-2xl shadow-none ring-border">
        <CardHeader>
          <CardTitle className="truncate">{step.fileName}</CardTitle>
          <CardDescription>
            {missing.length > 0
              ? `Choose a column for ${missing.join(", ")} to continue.`
              : `${plural(plan.loans.length, "loan")} ready · ${plural(plan.skipped.length, "row")} skipped`}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end gap-2">
          {picker}
          <Button variant="ghost" disabled={busy} onClick={() => fileInput.current?.click()}>
            Choose another file
          </Button>
          <Button disabled={busy || missing.length > 0 || plan.loans.length === 0} onClick={() => void runImport()}>
            {busy && <Spinner data-icon="inline-start" />}
            Import {plural(plan.loans.length, "loan")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
