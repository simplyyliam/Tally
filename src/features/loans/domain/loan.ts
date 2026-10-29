import { z } from "zod"
import { isIsoDate } from "@/shared/lib/dates"

/**
 * The shape of a loan. One Zod schema per entity: everything read from
 * storage, a backup or an import passes through these before the app uses it.
 */

const isoDate = z.string().refine(isIsoDate, "Use a date like 2026-10-29")
const timestamp = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid timestamp")

/** Who has the loan, as typed at the handover. Kept on the loan as a snapshot. */
export const borrowerDetailsSchema = z.object({
  name: z.string().trim().min(1, "Borrower name is required"),
  cellphone: z.string().trim().default(""),
  whatsapp: z.string().trim().default(""),
  department: z.string().trim().default(""),
  employeeNumber: z.string().trim().default(""),
})

export const loanLineSchema = z
  .object({
    id: z.string().min(1),
    description: z.string().trim().min(1, "Describe the item"),
    quantity: z.number().int().min(1),
    quantityReturned: z.number().int().min(0).default(0),
  })
  .refine((line) => line.quantityReturned <= line.quantity, {
    message: "More returned than were lent",
    path: ["quantityReturned"],
  })

export const loanSchema = z.object({
  id: z.string().min(1),
  borrower: borrowerDetailsSchema,
  lines: z.array(loanLineSchema).min(1, "A loan needs at least one item"),
  startDate: isoDate,
  expectedReturnDate: isoDate,
  /** The first agreed return date; set the first time a loan is extended. */
  originalReturnDate: isoDate.optional(),
  issuedBy: z.string().trim().default(""),
  notes: z.string().default(""),
  createdAt: timestamp,
  updatedAt: timestamp,
  returnedAt: timestamp.optional(),
  /** Demo records can be cleared in one go without touching real loans. */
  isDemo: z.boolean().default(false),
})

export type BorrowerDetails = z.infer<typeof borrowerDetailsSchema>
export type LoanLine = z.infer<typeof loanLineSchema>
export type Loan = z.infer<typeof loanSchema>

/** What the loan form produces before the repository gives it an id and timestamps. */
export const loanDraftSchema = z
  .object({
    borrower: borrowerDetailsSchema,
    lines: z
      .array(
        z.object({
          description: z.string().trim().min(1, "Describe the item"),
          quantity: z.number().int().min(1, "At least 1"),
        }),
      )
      .min(1, "Add at least one item"),
    startDate: isoDate,
    expectedReturnDate: isoDate,
    issuedBy: z.string().trim().default(""),
    notes: z.string().default(""),
    isDemo: z.boolean().default(false),
  })
  .refine((draft) => draft.expectedReturnDate >= draft.startDate, {
    message: "Return date can't be before the start date",
    path: ["expectedReturnDate"],
  })

export type LoanDraft = z.infer<typeof loanDraftSchema>
