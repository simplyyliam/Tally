import { useRef, useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useSettingsRepository } from "@/features/settings"
import { formatDate, todayIso } from "@/shared/lib/dates"
import { DEFAULT_REMINDER_TEMPLATE, TEMPLATE_PLACEHOLDERS, renderTemplate, unknownPlaceholders, type TemplateValues } from "../domain/template"
import { useReminderTemplate } from "../data/use-reminder-template"

/** Made-up values so the preview reads like a real message. */
function sampleValues(): TemplateValues {
  return {
    name: "Thandi",
    items: "- 2 × Extension lead\n- 1 × Cordless drill",
    dueDate: formatDate(todayIso()),
    daysOverdue: "0",
    reference: `LN-${todayIso().slice(0, 4)}-0001`,
  }
}

/** Settings card: edit the WhatsApp reminder text, with placeholders and a live preview. */
export function ReminderTemplateCard() {
  const repository = useSettingsRepository()
  const saved = useReminderTemplate()
  const [draft, setDraft] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const text = draft ?? saved
  const unknown = unknownPlaceholders(text)

  const insert = (placeholder: string) => {
    const box = textareaRef.current
    const token = `{${placeholder}}`
    const start = box?.selectionStart ?? text.length
    const end = box?.selectionEnd ?? text.length
    setDraft(text.slice(0, start) + token + text.slice(end))
    requestAnimationFrame(() => {
      box?.focus()
      box?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const save = async (next: string) => {
    // Saving the built-in text stores "" so future improvements to it still apply.
    await repository.update({ reminderTemplate: next === DEFAULT_REMINDER_TEMPLATE ? "" : next })
    setDraft(null)
    toast.success("Reminder text saved")
  }

  return (
    <Card className="rounded-2xl shadow-none ring-border">
      <CardHeader>
        <CardTitle>WhatsApp reminder</CardTitle>
        <CardDescription>The message that opens in WhatsApp when you press a reminder button</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="reminder-template">Message</FieldLabel>
          <Textarea
            ref={textareaRef}
            id="reminder-template"
            rows={7}
            value={text}
            aria-invalid={unknown.length > 0 || undefined}
            onChange={(event) => setDraft(event.target.value)}
          />
          <FieldDescription>Tap a placeholder to insert it where the cursor is.</FieldDescription>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_PLACEHOLDERS.map((placeholder) => (
              <Button key={placeholder} type="button" variant="outline" size="xs" className="font-mono" onClick={() => insert(placeholder)}>
                {`{${placeholder}}`}
              </Button>
            ))}
          </div>
        </Field>
        {unknown.length > 0 && (
          <Alert className="border-amber-text/15 bg-amber-tint text-amber-text">
            <TriangleAlert />
            <AlertDescription className="text-amber-text">
              {unknown.map((key) => `{${key}}`).join(", ")} {unknown.length === 1 ? "isn't a placeholder" : "aren't placeholders"} and will be
              sent exactly as typed.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Preview</span>
          <p className="rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">{renderTemplate(text, sampleValues())}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" disabled={text === DEFAULT_REMINDER_TEMPLATE} onClick={() => setDraft(DEFAULT_REMINDER_TEMPLATE)}>
          Use the default
        </Button>
        <Button disabled={draft === null || draft === saved || !draft.trim()} onClick={() => draft !== null && save(draft)}>
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}
