import { useState } from "react"
import { FlaskConical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useBorrowerRepository } from "@/features/borrowers"
import { useActivityRepository, useLoanRepository, useLoans } from "@/features/loans"
import { nowTimestamp, todayIso } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import { clearDemoData, loadDemoData } from "../data/demo-data"

/** Settings card: sample loans to try things out with. Never loaded automatically. */
export function DemoDataCard() {
  const { data: loans = [] } = useLoans()
  const loanRepository = useLoanRepository()
  const activity = useActivityRepository()
  const borrowers = useBorrowerRepository()
  const [busy, setBusy] = useState(false)
  const demoCount = loans.filter((loan) => loan.isDemo).length

  const run = async (work: () => Promise<string>) => {
    setBusy(true)
    try {
      toast.success(await work())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-none ring-border">
      <CardHeader>
        <CardTitle>Demo data</CardTitle>
        <CardDescription>Sample loans for trying Tally out or showing someone how it works. Your real loans are never touched.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {demoCount > 0 ? `${plural(demoCount, "demo loan")} loaded. WhatsApp is turned off for them.` : "No demo loans loaded."}
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          className="hover:text-destructive"
          disabled={busy || demoCount === 0}
          onClick={() => run(async () => `Cleared ${plural(await clearDemoData({ loans: loanRepository, activity, borrowers }), "demo loan")}`)}
        >
          <Trash2 data-icon="inline-start" />
          Clear demo data
        </Button>
        <Button
          variant="outline"
          disabled={busy || demoCount > 0}
          onClick={() => run(async () => `Loaded ${plural(await loadDemoData(loanRepository, todayIso(), nowTimestamp()), "demo loan")}`)}
        >
          <FlaskConical data-icon="inline-start" />
          Load demo data
        </Button>
      </CardFooter>
    </Card>
  )
}
