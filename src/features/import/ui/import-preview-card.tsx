import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TONE_CLASSES } from "@/shared/lib/tones"
import type { ImportPlan } from "../domain/build-import"
import { IMPORT_FIELDS, type ColumnMapping } from "../domain/import-fields"

export const PREVIEW_ROWS = 10

interface ImportPreviewCardProps {
  rows: ReadonlyArray<ReadonlyArray<string>>
  mapping: ColumnMapping
  plan: ImportPlan
}

/** The first rows as they'll be read, each marked ready or skipped. */
export function ImportPreviewCard({ rows, mapping, plan }: ImportPreviewCardProps) {
  const fields = IMPORT_FIELDS.filter((field) => mapping[field.id] !== null)
  const skippedByRow = new Map(plan.skipped.map((skipped) => [skipped.row, skipped.reasons]))
  const warnedRows = new Set(plan.warnings.map((warning) => warning.row))

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none ring-border">
      <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
        <CardTitle className="text-sm font-medium">Preview</CardTitle>
        <CardDescription className="text-xs">
          The first {Math.min(PREVIEW_ROWS, rows.length)} of {rows.length} rows
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">Row</TableHead>
              {fields.map((field) => (
                <TableHead key={field.id}>{field.label}</TableHead>
              ))}
              <TableHead className="pr-4">Check</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, PREVIEW_ROWS).map((cells, index) => {
              const row = index + 2
              const reasons = skippedByRow.get(row)
              return (
                <TableRow key={row}>
                  <TableCell className="pl-4 text-muted-foreground tabular">{row}</TableCell>
                  {fields.map((field) => (
                    <TableCell key={field.id} className="max-w-48 truncate">
                      {cells[mapping[field.id] ?? -1] ?? ""}
                    </TableCell>
                  ))}
                  <TableCell className="pr-4">
                    {reasons ? (
                      <Badge className={TONE_CLASSES.red} title={reasons.join("; ")}>
                        Skipped
                      </Badge>
                    ) : (
                      <Badge className={warnedRows.has(row) ? TONE_CLASSES.amber : TONE_CLASSES.green}>{warnedRows.has(row) ? "Check" : "Ready"}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
