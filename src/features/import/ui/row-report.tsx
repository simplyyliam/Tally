import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { plural } from "@/shared/lib/text"
import type { ImportPlan } from "../domain/build-import"

/** Every skipped row and warning, by spreadsheet row number, so the file can be fixed. */
export function RowReport({ plan }: { plan: ImportPlan }) {
  if (plan.skipped.length === 0 && plan.warnings.length === 0) return null
  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-none ring-border">
      <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
        <CardTitle className="text-sm font-medium">Rows to check</CardTitle>
        <CardDescription className="text-xs">
          {plural(plan.skipped.length, "row")} skipped · {plural(plan.warnings.length, "warning")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="max-h-72 divide-y divide-border overflow-y-auto text-sm">
          {plan.skipped.map((skipped) => (
            <li key={`skip-${skipped.row}`} className="flex gap-3 px-4 py-2.5">
              <span className="w-14 shrink-0 text-muted-foreground tabular">Row {skipped.row}</span>
              <span className="text-red-text">Skipped: {skipped.reasons.join("; ")}</span>
            </li>
          ))}
          {plan.warnings.map((warning, index) => (
            <li key={`warn-${warning.row}-${index}`} className="flex gap-3 px-4 py-2.5">
              <span className="w-14 shrink-0 text-muted-foreground tabular">Row {warning.row}</span>
              <span className="text-amber-text">{warning.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
