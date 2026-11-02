# Decisions

Calls made while building v1.0 where the plan was silent, unclear, or didn't match the repo.
Each one took the safe option. Items marked **open** need the owner's confirmation.

| # | Decision | Why | Status |
| --- | --- | --- | --- |
| 1 | v1.0 builds every feature from scratch | The plan describes an existing app with 35 features, but the repo was an empty Vite + shadcn template | open |
| 2 | The pre-v1.0 storage format is a guess | No legacy code existed. The migration reads common flat-row shapes under the keys `tally-loans`, `tally.loans`, `loanRegister` and `loans`, and keeps the original text | **open**: check against the real downloadable version's key and fields |
| 3 | Lint uses oxlint, not ESLint | The project already used oxlint. The same boundary rules live in `.oxlintrc.json` | open |
| 4 | `docs/design/` stays gitignored | It was already ignored, so the reference images aren't in the repo | open |
| 5 | The release plan lives at `docs/release/release-plan.md` | Moved there at the owner's request | done |
| 6 | Test files may import other features' test fixtures | The boundary rule is turned off for `*.test.ts` | done |
| 7 | Reminders list only the items still out | After a partial return, asking for items already returned would confuse the borrower. The "Due tomorrow" message still includes the reference, each item with its quantity, and the return date | **open** |
| 8 | The downloadable version is a new single-file build | No downloadable build existed to keep working. `npm run build:offline` makes `dist-offline/index.html`, which opens from `file://` | open |
| 9 | An empty `reminderTemplate` means "use the built-in text" | Settings stays independent of the reminders feature (no import cycle), and future improvements to the default reach everyone who never customised it | done |
| 10 | The consent switch is saved when the loan is saved | The borrower key comes from the phone number, which can change while the form is being typed | done |
| 11 | An import row with a bad phone number is imported without the number, which goes into the notes as a warning | Dropping a whole loan over a typo in a phone number would lose a record. Rows with no name, no item or no usable return date are skipped and listed | **open** |
| 12 | Imported dates are read day-first (DD/MM/YYYY) | That is the South African convention. ISO dates, "29 Oct 2026" and Excel date serials are also accepted | **open** if any registers use US-style dates |
| 13 | The import "Returned" or "Status" column closes a loan only on a date or a clear word (yes, returned, x…) | Closing a loan by mistake hides a missing item, while leaving one open by mistake is visible and easy to fix | done |
| 14 | Import rows that share a loan number become one multi-item loan with a new `LN-` reference | Tally's own CSV export has one row per item. References are never reused, so imported loans get fresh ones | done |
| 15 | The import step can't read old `.xls` files | `read-excel-file` reads `.xlsx` only. Staff are asked to save as `.xlsx` or `.csv` | done |
| 16 | The activity log also records Undo, and imports log as "Issued" | The log should match what actually happened to each loan | done |
| 17 | Purging old loans isn't logged | Activity entries belong to a loan, and purging removes them with it. The confirmation dialog states the count and offers a backup first | **open** |
| 18 | Demo loans are numbered from `LN-YYYY-9001` and never open WhatsApp | Loading the demo shouldn't use up real loan numbers, and demo phone numbers might belong to real people | done |
| 19 | The Activity page is in the main sidebar, and Import is under Data | `docs/design/` has no screen for either, so they reuse the closest references: the column mapping follows the "Filters" panel (label plus pill Select per row, a match count in the footer), the preview follows the documents table with tinted badges, and loan history uses the timeline reference | **open**: no direct design reference |
| 20 | The Excel reader is downloaded in the background after start-up | Keeps the first load light while still letting `.xlsx` import work if the internet drops later | done |
