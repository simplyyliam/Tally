import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IMPORT_FIELDS, type ColumnMapping, type ImportFieldId } from "../domain/import-fields"

const NOT_IMPORTED = "none"

interface ColumnMappingCardProps {
  headers: ReadonlyArray<string>
  mapping: ColumnMapping
  onChange: (mapping: ColumnMapping) => void
}

/** One Select per loan field, pre-filled with our guess, so staff only fix what's wrong. */
export function ColumnMappingCard({ headers, mapping, onChange }: ColumnMappingCardProps) {
  const items = [
    { value: NOT_IMPORTED, label: "Don't import" },
    ...headers.map((header, index) => ({ value: String(index), label: header.trim() || `Column ${index + 1}` })),
  ]

  const setColumn = (field: ImportFieldId, value: string | null) => {
    const column = value === null || value === NOT_IMPORTED ? null : Number(value)
    // A column fills one field only: picking it here clears it elsewhere.
    const next = { ...mapping }
    for (const key of Object.keys(next) as ImportFieldId[]) {
      if (column !== null && next[key] === column) next[key] = null
    }
    next[field] = column
    onChange(next)
  }

  return (
    <Card className="rounded-2xl shadow-none ring-border">
      <CardHeader>
        <CardTitle>Match the columns</CardTitle>
        <CardDescription>We guessed from the headers. Fix any that are wrong; fields marked * are needed.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {IMPORT_FIELDS.map((field) => (
          <Field key={field.id} orientation="horizontal" className="justify-between">
            <FieldLabel htmlFor={`import-${field.id}`} className="shrink-0 font-normal">
              {field.label}
              {field.required && <span className="text-red-text">*</span>}
            </FieldLabel>
            <Select
              items={items}
              value={mapping[field.id] === null ? NOT_IMPORTED : String(mapping[field.id])}
              onValueChange={(value) => setColumn(field.id, value)}
            >
              <SelectTrigger id={`import-${field.id}`} size="sm" className="w-44 min-w-0" aria-invalid={(field.required && mapping[field.id] === null) || undefined}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ))}
      </CardContent>
    </Card>
  )
}
