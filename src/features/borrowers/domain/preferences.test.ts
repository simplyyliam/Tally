import { describe, expect, it } from "vitest"
import { makeLoan } from "@/features/loans/domain/test-loans"
import { orphanedPreferenceKeys } from "./borrower"

describe("borrower preferences after a purge", () => {
  it("borrower preferences are dropped only when no loan is left for that borrower", () => {
    const preferences = [
      { key: "phone:27821234567", whatsappConsent: false, updatedAt: "2025-01-01T00:00:00Z" },
      { key: "name:sipho", whatsappConsent: false, updatedAt: "2025-01-01T00:00:00Z" },
    ]
    const remaining = [makeLoan({ borrower: { name: "Thandi Nkosi", cellphone: "082 123 4567", whatsapp: "", department: "", employeeNumber: "" } })]
    expect(orphanedPreferenceKeys(preferences, remaining)).toEqual(["name:sipho"])
  })
})
