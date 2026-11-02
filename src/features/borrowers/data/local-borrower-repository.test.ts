import { describe, expect, it } from "vitest"
import { LocalDocumentStore, createMemoryStorage } from "@/shared/schema/local-document"
import { LocalBorrowerRepository } from "./local-borrower-repository"

const repository = () => new LocalBorrowerRepository(new LocalDocumentStore(createMemoryStorage()))

describe("WhatsApp consent", () => {
  it("a borrower with no saved preference has nothing stored, so consent defaults to on", async () => {
    expect(await repository().listPreferences()).toEqual([])
  })

  it("opting a borrower out is remembered and can be turned back on", async () => {
    const borrowers = repository()
    await borrowers.setWhatsappConsent("phone:27821234567", false)
    expect((await borrowers.listPreferences())[0]).toMatchObject({ key: "phone:27821234567", whatsappConsent: false })
    await borrowers.setWhatsappConsent("phone:27821234567", true)
    const preferences = await borrowers.listPreferences()
    expect(preferences).toHaveLength(1)
    expect(preferences[0].whatsappConsent).toBe(true)
  })
})
