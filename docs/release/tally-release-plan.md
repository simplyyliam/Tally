# Tally — Product Philosophy & Release Plan

Oct 29, 2026 · Liam Matthews

## Summary

Ship **v1.0 "Trusted Register"** first: the 35 features you already have, hardened, plus additions that make the register something your dad can trust every day without a server. It stays local-first (browser storage, no login, no hosting bill), but adds backup/restore, Excel import, borrower profiles, multi-item loans with partial returns, unique loan numbers, and a POPIA-friendly WhatsApp consent field.

Everything after that is staged into four follow-up releases, each one adding a single big idea: going online with staff accounts and a live Google Sheet (v1.1), automatic WhatsApp reminders (v1.2), items with QR codes (v1.3), and reservations, sign-off and reports (v1.4). Nine features are parked on purpose.

Every release section below has a full build spec and a short `/goal` prompt that points the agent to it. **Keep this file in the repo at `docs/release-plan.md`** so the agent can read it.

## Product philosophy

A loan register lives or dies on one thing: **when someone asks "who has it?", the screen is right.** Every feature is judged by whether it makes that answer more trustworthy or faster to get.

What the research says about why these tools succeed or fail:

- **Records drift from reality.** The common failure of sheet-based checkout is that people skip the check-in step, so the list stops matching the shelf. Once staff walk to the storeroom to confirm instead of trusting the list, it has already failed. ([Cheqroom](https://www.cheqroom.com/blog/easy-equipment-checkout-system-with-spreadsheets/), [Cheqroom](https://www.cheqroom.com/blog/why-equipment-tracking-spreadsheets-fail/))
- **Too much, too soon kills adoption.** Teams that jump to heavy, rigid asset systems often drift back to spreadsheets. ([Cheqroom](https://www.cheqroom.com/blog/5-equipment-tracking-problems-spreadsheet-scares/)) Rollouts also fail when the people doing the work aren't included early. ([GoCodes](https://gocodes.com/?p=25652))
- **Accountability is the real product.** Paid tools sell "chain of custody": a record of who took it, who handed it over, and in what condition, so the conversation is never "I thought Dave had it". ([Cheqroom](https://www.cheqroom.com/blog/equipment-management-software-why-is-it-better-than-spreadsheets/))
- **Small-team tools win on simple basics.** Tools aimed at churches, schools and workshops lead with due dates, overdue visibility, custody and condition history, and CSV import/export. ([WhoHasGear](https://sourceforge.net/software/product/WhoHasGear/), [Lend Engine](https://www.lend-engine.com/))
- **Automated WhatsApp has a real cost.** Outbound reminders are "utility template" messages, charged per message outside the 24-hour service window; South Africa's utility rate is about US$0.0076 each, plus a provider fee. ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), [rate table](https://whautomate.com/whatsapp-business-api-pricing))
- **Phone numbers are personal information under POPIA.** Store them for a stated purpose, keep only what's needed, secure them, and honour withdrawal of consent. ([SME South Africa](https://smesouthafrica.co.za/what-small-businesses-need-to-do-to-stay-popia-compliant/), [Eskom POPIA page](https://www.eskom.co.za/paia-popia/protection-of-personal-information-act-popia/))

The seven principles this plan follows:

1. **Faster than paper.** Issuing a loan should take under 30 seconds; returning one, two taps. If it's slower than a sign-out sheet, it gets skipped.
2. **Status changes at the handover, never later.** Issue and return are the most prominent actions on every screen.
3. **Every action has a who and a when.** Issued by, returned to, timestamps, and an activity log. That's the accountability people pay for.
4. **Earn each layer of complexity.** No accounts, servers or hardware until a real user needs them. Each release adds one big idea.
5. **Meet borrowers on WhatsApp.** The free `wa.me` link stays the default; paid automation is opt-in per organisation.
6. **Collect only what you need (POPIA).** Record WhatsApp consent, allow opt-out, and let old returned records be purged.
7. **The data is always yours.** Export and backup are available in every version, so nobody is ever locked in.

## Feature triage

Of the 106 features plus your dad's live Google Sheet (#107), 47 ship in v1.0, 50 are spread over v1.1 to v1.4, and 10 are parked. Each number is spelled out in "All 106 features" at the end of this plan.

| Release | Features (#) | Why here |
| --- | --- | --- |
| v1.0 Trusted Register | 1 to 35 (existing, hardened); 82, 83 loan numbers + timestamps; 75, 76 borrower profiles + history; 52 Excel/CSV import; 53, 54 multi-item loans + bulk/partial returns; 50, 51 backup + restore (file-based); 43 WhatsApp consent + opt-out (manual); 97 editable reminder template; 105 purge old returned records | Makes the local app trustworthy and fast with no server, no login and no monthly cost. Your dad can use it from day one. |
| v1.1 Online, Shared & Google Sheets | 44, 45, 46, 47, 48, 49, 84, 85, 102, 104, 107 (+ 50, 51 become automatic) | Needed before reminders can send on their own: a server that is always on, staff accounts and one source of truth. The live Google Sheet means your dad never has to export. |
| v1.2 Automatic Reminders | 36, 37, 38, 39, 40, 41, 42, 95, 96, 98 | Your dad's top request. Sent from one app-owned WhatsApp number, so organisations don't need their own Meta setup. |
| v1.3 Items & QR | 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70 | Moves from "loans of described things" to "loans of known items", once the shared database exists. |
| v1.4 Reservations, Sign-off & Reports | 71, 72, 73, 79, 80, 81, 86, 87, 88, 89, 90, 91, 92, 103 | Only valuable once there is history and shared data to report on and book against. |
| Parked | 69, 74, 77, 78, 93, 94, 99, 100, 101, 106 (+ 30 sample data becomes a "demo mode" only) | Wait for a real user to ask: borrower portal, waiting lists, maintenance, multi-branch, custom fields, SMS, multi-language, offline phone use, public API. |

The main judgement calls:

- **Backup before cloud.** Browser storage can be wiped by clearing site data, so a one-tap backup file (and a reminder to make one weekly) is the most important v1.0 addition.
- **Multi-item loans before QR.** Most real loans are "3 extension cords and a projector" to one person; one record per item makes returns painful.
- **Automation before QR.** Your dad's main ask is the automatic reminder, so going online (v1.1) and reminders (v1.2) come before the item catalogue and scanning (v1.3).
- **The Google Sheet is a one-way mirror.** The app writes every change to the sheet; edits made in the sheet don't flow back, so the app stays the single source of truth.
- **SMS (99) is parked.** WhatsApp already covers the South African audience, and SMS is a second paid channel to maintain.

## Roadmap at a glance

Each release adds one big idea, and v1.0 ships with no server.

| Release | Big idea | Gate before starting the next |
| --- | --- | --- |
| **v1.0 Trusted Register** (first launch) | Local-first, no login: backup, import, borrowers, multi-item loans, offline | Dad uses it daily for 2 weeks with no lost data |
| v1.1 Online, Shared & Google Sheets | Online database, staff accounts and roles, audit trail, live Google Sheet | App's WhatsApp number registered and templates approved |
| v1.2 Automatic Reminders | WhatsApp before, on and after the due date from the app's own number, delivery status, opt-out | Items need tracking by label, not just description |
| v1.3 Items & QR | Item catalogue, asset IDs, QR labels, scan to issue and return, condition | A few months of shared loan history to report on |
| v1.4 Reservations, Sign-off & Reports | Booking without clashes, borrower signatures, monthly reports | — |

Don't start a release until the gate above it is met; the gates keep each step tied to a real need.

## Rules for every release

These rules are baked into every `/goal` prompt below, so each prompt can be pasted on its own.

1. **UI follows `docs/design/`.** Before building any screen, the agent reads every reference image and note in `docs/design/` and matches its layout, spacing, type, colour and components. If a screen has no reference, it reuses the closest existing pattern and lists that screen under NEEDS YOUR DECISION. No new visual style is invented.
2. **Never lose a record.** Stored data carries a `schemaVersion`. Any shape change ships with a migration that runs on load, plus a test that loads the previous version's data.
3. **One release, one branch.** `release/vX.Y-<name>`, merged to `main` by pull request, then tagged.
4. **Conventional Commits.** `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, with short bullet-point bodies.
5. **Green before done.** Lint, type-check, tests and production build all pass. `CHANGELOG.md` and the `package.json` version are updated.
6. **Desktop and phone.** Every new flow works on a desktop (1280 px+) and a phone (375 px); issue and return stay one click or tap from the dashboard.
7. **Short report.** Each run ends with a STATUS / CHECKS / NEEDS YOUR DECISION block, so you only paste output back when something failed or needs a call.

## Architecture: built to grow, readable without AI

The aim is that **each release adds new folders and new implementations, and leaves existing code alone.** No codebase can promise zero refactoring forever, but the costly kind (rewriting screens to add a database, or untangling status logic to add reminders) is designed out in v1.0, before there is much code to move.

Five decisions make the later releases additive:

1. **Feature folders.** Each feature (loans, borrowers, items, reminders, reports, settings) owns its UI, logic and data access. Adding "items" in v1.3 means adding `features/items`, not editing loans.
2. **Pure domain logic.** Status, overdue days, partial returns and availability are plain TypeScript functions with no React and no storage. They are the most-tested code, and they never change when the UI or database does.
3. **Repository interfaces from day one.** UI talks to `LoanRepository`, never to localStorage directly. v1.0 ships a local implementation; v1.1 adds a Supabase one and swaps it in one file. Screens don't change.
4. **Channel interfaces for messaging.** Reminders go through a `ReminderChannel` interface. v1.0's `wa.me` link, v1.2's WhatsApp Cloud API and email are three implementations of the same thing.
5. **Validated boundaries.** Data entering the app (storage, backups, imports, later the API) is checked with one schema per entity (Zod), so bad data stops at the door.

The folder shape every release follows:

```text
src/
  app/              routes, layout, providers (picks local vs Supabase repos)
  features/
    loans/
      domain/       types, status + overdue rules (pure, unit-tested)
      data/         LoanRepository interface + implementations
      ui/           screens and components for loans only
      index.ts      the only thing other features may import
    borrowers/      same shape
    items/          added in v1.3
    reminders/      ReminderChannel + implementations
    settings/
  shared/
    ui/             design-system components from docs/design
    lib/            dates (one module, Africa/Johannesburg), ids, formatting
    schema/         storage version + migrations
docs/
  design/           your reference images
  architecture.md   this structure and its rules, in plain words
  adr/              one short note per big decision (why Supabase, why Google Sheets)
```

So a person can follow it without AI:

- **Plain over clever.** Descriptive names, small files (aim under ~250 lines), no one-off abstractions, no magic generics.
- **Comments say why, not what.** Business rules (e.g. why a partial return keeps a loan open) are explained where they live.
- **Tests are the spec.** Domain tests read as sentences: "a loan due yesterday with one item out is overdue by 1 day".
- **Boundaries are enforced by lint**, not memory: a feature can only import another feature's `index.ts`, and `domain/` can't import React or storage.
- **README + `docs/architecture.md` + ADRs** explain how to run it, where things go and why decisions were made. Every release updates them.

## v1.0 — Trusted Register (first launch)

**Goal:** your dad uses it every day on his computer or phone instead of paper, and never loses data. Branch `release/v1.0-trusted-register`, tag `v1.0.0`.

**Done when:**

- [ ] A loan with 3 different items to one borrower takes under 30 seconds to register
- [ ] Returning part of a loan (2 of 3 items) works and shows what's still out
- [ ] Typing a borrower's name suggests past borrowers and fills their phone, department and work number
- [ ] Every loan has a reference like `LN-2026-0001` and timestamps for issue, extend and return
- [ ] Backup downloads a file; Restore on another device brings everything back
- [ ] An Excel/CSV register can be imported with a column-mapping preview
- [ ] WhatsApp button is disabled for borrowers who opted out
- [ ] Everything keeps working with the internet off while the page is open
- [ ] Every screen works on a desktop (1280px+) and a phone (375px)
- [ ] Overdue borrowers' names show in red on the list and dashboard
- [ ] A Returned tab lists returned loans with the borrower's name struck through and status "Returned"
- [ ] Saving a complete loan clears the form, ready for the next borrower
- [ ] Extending a loan edits its return date and shows the extension indicator
- [ ] A "Due tomorrow" list offers a one-tap WhatsApp message with the loan reference, each item with its quantity, and the return date

### Build spec

**Context**

- This is an existing browser-based loan register (features: register/edit/delete loans, quantity, borrower name, cellphone, WhatsApp, start + expected return date, department, employee number, issuing staff, notes, mark returned, extend dates, auto status incl. overdue/due-today/returned, overdue-day count, extension indicator, dashboard, search/filter/sort, WhatsApp reminder via wa.me link, CSV export, sample data, local browser storage, mobile-friendly).
- First, inspect the repo and summarise the stack, folder structure and how data is stored. Keep the existing stack. Do not add a backend, login or paid service in this release.

**Design**

- Before touching UI, read everything in docs/design/ (reference images + notes) and match its layout, spacing, typography, colours and components. If a screen has no reference, reuse the closest existing pattern and list the screen under NEEDS YOUR DECISION. Do not invent a new visual style.
- Responsive for desktop and phone: on desktop (1280px+) show a wide, scannable loan table with keyboard-friendly entry (Tab through the form, Enter saves, a shortcut opens "New loan"); on phone (375px) switch the table to stacked cards and keep Issue, Return and the WhatsApp button as large tap targets. Issue and Return must be one click or tap from the dashboard on both.

**Build**

0. Architecture foundation (do this first, in its own commits): restructure into src/app, src/features/<feature>/{domain,data,ui,index.ts} and src/shared/{ui,lib,schema}. Move status/overdue/date rules into pure, unit-tested domain functions (no React, no storage). Put all storage behind repository interfaces (LoanRepository, BorrowerRepository) with a local implementation chosen in one place in src/app. Validate stored, imported and restored data with Zod schemas. Send reminders through a ReminderChannel interface (wa.me implementation for now). Enforce boundaries with ESLint (features import each other only via index.ts; domain cannot import React or storage). Write README.md (run, test, structure), docs/architecture.md (the structure and rules in plain words) and docs/adr/0001-feature-folders-and-repositories.md. Prefer plain, descriptive code over clever abstractions; files under ~250 lines; comments explain why. Behaviour must be unchanged after this step, proven by tests.
1. Data safety: add a schemaVersion to stored data and a migration that upgrades existing records on load without losing any. Add a test that loads pre-v1.0 data.
2. Loan references + timestamps: every loan gets a unique, readable reference (LN-YYYY-NNNN). Store createdAt, issuedAt, extendedAt[] and returnedAt as ISO timestamps; show them on the loan detail.
3. Multi-item loans: one loan can hold several line items (description, quantity). Support returning all items at once, or a partial return per line (quantity returned). Status and overdue logic work per line and roll up to the loan. Bulk-select loans in the list and mark them returned.
4. Borrower profiles: derive a borrower list from loans (match on cellphone, fallback name). Autocomplete the borrower field and prefill phone, WhatsApp, department and employee number. Add a borrower page with their full loan history and currently-out items.
5. Backup + restore: "Download backup" exports all data as a dated JSON file; "Restore" validates the file, shows a summary (loan and borrower counts) and asks before replacing. Show a gentle banner if no backup was made in 7 days.
6. Excel/CSV import: accept .csv and .xlsx, show a column-mapping step with a preview of the first 10 rows, validate dates and phone numbers, report skipped rows, and import as normal loans.
7. WhatsApp consent: per-borrower flag "OK to contact on WhatsApp" (default on, with a one-line POPIA note at the point of capture). If off, hide/disable the WhatsApp reminder button. Let the reminder message template be edited in Settings with placeholders {name}, {items}, {dueDate}, {daysOverdue}, {reference}.
8. Data retention: in Settings, "Delete returned loans older than N months" with a confirmation that shows how many records will go.
9. Activity log (local): record create, edit, extend, return and delete with timestamp and issuing staff name; show it on each loan.
10. No PWA or service worker in this release (used in a browser on desktop and phone). Keep the downloadable version working, and make sure every feature works with the internet off while the page is open.
11. Sample data: move to a "Load demo data" button in Settings with a matching "Clear demo data"; never load it automatically for real users.
12. Your dad's workflow (must match exactly): overdue borrowers' names render red; a Returned tab lists returned loans with the borrower's name struck through and status "Returned"; saving a complete loan resets the form for the next borrower; extending a loan edits its expected return date and shows the extension indicator; a "Due tomorrow" dashboard list offers a one-tap wa.me message containing the loan reference, every item with its quantity, and the return date (automatic sending arrives in v1.2).

**Quality**

- Unit tests for status calculation, overdue days, partial returns, migration, import parsing and backup round-trip.
- Lint, type-check, tests and production build must pass.
- Update CHANGELOG.md (v1.0.0 section) and set package.json version to 1.0.0.
- Commit in small Conventional Commits (feat:, fix:, refactor:, test:, docs:, chore:) with short bullet-point bodies.
- Do not merge or tag; stop with the branch ready for a PR.

### `/goal` prompt

```text
/goal Ship v1.0 "Trusted Register" of Tally on branch release/v1.0-trusted-register.

Read docs/release-plan.md before writing code. Follow "Rules for every release" and "Architecture: built to grow, readable without AI", then build everything in the "v1.0 — Trusted Register (first launch)" section: every numbered Build step, every Quality item and any "Done when" items. UI must match docs/design/. If the plan and the code disagree, or a step is unclear, do the safe thing and list it under NEEDS YOUR DECISION.

Do not merge, tag or deploy; stop with the branch ready for a PR.

END YOUR RUN WITH EXACTLY:
STATUS: done | blocked (one line why)
CHECKS: lint ✓/✗, types ✓/✗, tests ✓/✗ (count), build ✓/✗
NEEDS YOUR DECISION: bullet list, or "none"
```

## v1.1 — Online, Shared & Google Sheets

**Goal:** several staff on several devices see the same register, every action is signed by a logged-in person, and other organisations can sign up for their own private register. Every loan also appears in a live Google Sheet. Branch `release/v1.1-online-sheets`, tag `v1.1.0`.

**Decision before you start:** the spec assumes **Supabase** (Postgres, auth, row-level security, scheduled jobs and backups in one free-tier service), which suits a solo developer and is reused by v1.2's reminder scheduler. If you'd rather use your Express + Prisma setup, change the Backend part of the spec first.

### Build spec

**Context**

- v1.0 is local-first (browser storage, migrations, loans with line items, borrowers, backup JSON, repository interfaces). This release adds a shared online database while keeping offline use.
- Inspect the repo first and summarise the data layer. Follow docs/architecture.md: add Supabase implementations of the existing repository interfaces and switch them in src/app. Domain and UI code should not need changes; if any must change, explain why under NEEDS YOUR DECISION. Add an ADR (why Supabase) and update docs/architecture.md and README.md.

**Backend**

- Use Supabase: Postgres tables for organisations, memberships, borrowers, loans, loan_lines, activity_log, sheet_links; Supabase Auth (email + magic link; password optional).
- Multi-tenant: every row has organisation_id. Enforce isolation with Row Level Security policies, and add tests that prove a user in org A cannot read or write org B.
- Roles per organisation: admin (manage staff, settings, delete), staff (issue, return, extend, edit), viewer (read only). Enforce in RLS, not just the UI.
- Keep secrets in env vars; commit a .env.example only.

**Design**

- Read everything in docs/design/ before building UI (sign in, organisation setup, staff management, admin dashboard, Google Sheet connection) and match it. Screens without a reference: reuse the closest existing pattern and list them under NEEDS YOUR DECISION. No new visual style.
- Responsive: check every new screen on desktop (1280px+) and phone (375px).

**Build**

1. Onboarding: sign up -> create organisation -> invite staff by email with a role. Admin page to change roles and remove staff.
2. Move-to-cloud: on first sign-in, offer to upload the existing local data (or a v1.0 backup file) into the organisation, with a summary and confirmation. Never delete local data until upload is verified.
3. Issuing staff = the signed-in user automatically (keep a free-text override for "on behalf of").
4. Offline sync: reads cached locally; writes queued in IndexedDB while offline and synced when back online. Conflict rule: last write wins per field, but a return can never be undone by a stale edit; show a small "x changes waiting to sync" indicator.
5. Audit trail: activity_log written by a database trigger (who, what, when, before/after JSON) so it cannot be skipped by the client. Viewable per loan and as an admin log with filters (staff, action, date range).
6. Admin dashboard: totals per status, overdue by department, staff activity this week.
7. Backups: enable Supabase daily backups; keep the manual JSON/CSV export available to every admin.
8. Live Google Sheet (one-way mirror): an admin connects a Google Sheet (share it with the app's Google service account email, paste the sheet URL). A database webhook runs an Edge Function on every loan insert, update and return that upserts one row per loan line, keyed by loan reference + line, with all loan fields and status. New loans append; edits and returns update their row. Edits made in the sheet are not read back; say so in the UI. Failed syncs retry and appear in an admin "Sheet sync" status with a "Resync all" button.
9. Terms and privacy: add a short Terms page and a privacy notice explaining that the app processes borrowers' details on each organisation's behalf (POPIA), shown at sign-up and linked in the footer.

**Quality**

- Tests: RLS isolation, role permissions, offline queue replay, local-to-cloud upload, sheet row mapping and upsert (mock the Google API; never call it from CI).
- Lint, type-check, tests and build pass. CHANGELOG.md v1.1.0; package.json 1.1.0.
- Conventional Commits with short bullet bodies. Stop with the branch ready for a PR; do not merge, tag or deploy.

### `/goal` prompt

```text
/goal Ship v1.1 "Online, Shared & Google Sheets" of Tally on branch release/v1.1-online-sheets.

Read docs/release-plan.md before writing code. Follow "Rules for every release" and "Architecture: built to grow, readable without AI", then build everything in the "v1.1 — Online, Shared & Google Sheets" section: every numbered Build step, every Quality item and any "Done when" items. UI must match docs/design/. If the plan and the code disagree, or a step is unclear, do the safe thing and list it under NEEDS YOUR DECISION.

Do not merge, tag or deploy; stop with the branch ready for a PR.

END YOUR RUN WITH EXACTLY:
STATUS: done | blocked (one line why)
CHECKS: lint ✓/✗, types ✓/✗, tests ✓/✗ (count), build ✓/✗
NEEDS YOUR DECISION: bullet list, or "none"
```

## v1.2 — Automatic Reminders

**Goal:** borrowers get WhatsApp reminders before, on and after the due date without anyone pressing a button, and staff can see which messages arrived. Branch `release/v1.2-auto-reminders`, tag `v1.2.0`.

**What it costs to run:** each automated reminder is a WhatsApp utility template, about US$0.0076 in South Africa. At 100 loans a month with 3 reminders each, that's roughly US$2.30 a month. Using Meta's Cloud API directly avoids a provider fee. Rates change quarterly, so check Meta's page before launch. ([Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing))

**Before you start (you, not the agent):**

- [ ] Create a free Meta Business portfolio under the app's brand, plus a WhatsApp Cloud API app
- [ ] Get one number for the app: a cheap prepaid SIM or landline that isn't on WhatsApp. Verify it once by SMS or call; after that no phone needs to stay on (keep the SIM topped up)
- [ ] Build and test first on Meta's free test number (it messages up to 5 phones you add), then switch to the real number at launch
- [ ] Submit the three reminder templates (pre-due, due-today, overdue) as **Utility**, with the organisation name, loan reference, items with quantities and return date as variables
- [ ] Optional: complete business verification (free, needs a CIPC or tax document) to show the brand name and lift the 250-people-a-day cap

Reminders go out from **one app-owned number** for every organisation, so your dad (and anyone else) only ticks "Send reminders automatically". The Cloud API itself is free; you pay only per message. Unverified accounts can reach 250 different people a day across all organisations. ([Cloud API is free](https://www.go4whatsup.com/guides/whatsapp-cloud-api/), [messaging limits](https://guides.clickatell.com/whatsapp-channel/getting-started/get-business-verified)) The free `wa.me` button stays as a fallback.

### Build spec

**Context**

- Inspect the repo first and summarise how loans, borrowers (incl. WhatsApp consent) and settings are stored.
- Reminders are sent from ONE app-owned WhatsApp Cloud API number for all organisations (platform credentials in server-side env vars, never in the browser). Organisations only opt in and set their schedule. Every template names the organisation. Keep the manual wa.me button as a fallback.

**Design**

- Read everything in docs/design/ before building UI (reminder settings, message log, loan reminder timeline) and match it. Screens without a reference: reuse the closest existing pattern and list them under NEEDS YOUR DECISION. No new visual style.

**Build**

0. Follow docs/architecture.md: WhatsApp Cloud API and email are new ReminderChannel implementations in src/features/reminders; schedule rules are pure, unit-tested domain functions. Add an ADR and update docs/architecture.md and README.md.
1. Settings (admin): turn "Send reminders automatically" on or off and choose the schedule: N days before due (default 1), on the due day, overdue every N days (default 2) up to a max count (default 3). Default loan period and return policy text also live here. Template names per reminder type live in platform config, not per organisation. The pre-due reminder includes the organisation name, loan reference, every item with its quantity, and the return date.
2. Scheduler: a Supabase scheduled job (pg_cron) calling an Edge Function every 15 minutes. It finds due reminders, sends via the WhatsApp Cloud API, and records each send in a reminders table (loan, type, scheduled_for, sent_at, status, error). Send only between 08:00 and 18:00 Africa/Johannesburg; never send twice for the same loan + type + day (idempotency key). Respect the platform-wide daily limit (250 unique recipients while unverified): queue overflow for the next window and show it in the admin view.
3. Auto-cancel: returned loans, opted-out borrowers and fully returned lines never get reminders; extending a loan reschedules them.
4. Delivery status: a webhook Edge Function verifies Meta's signature and updates status (sent, delivered, read, failed). Show a reminder timeline on each loan and a Failed Messages list on the dashboard, with a one-tap fallback to the manual wa.me link.
5. Opt-out: if a borrower replies STOP (or similar), mark them opted out and log it. Staff can toggle consent on the borrower page.
6. Email fallback: if the borrower has an email and no WhatsApp consent, send the same reminder by email (Resend or similar), using the same scheduler and log.
7. Templates: show the approved template text with placeholder preview; keep body text editable only for the email channel.

**Quality**

- Tests: schedule calculation (incl. weekends and the time window), idempotency, auto-cancel on return/extend/opt-out, webhook signature verification. Mock the WhatsApp API in tests; never call it from CI.
- Lint, type-check, tests and build pass. CHANGELOG.md v1.2.0; package.json 1.2.0.
- Conventional Commits with short bullet bodies. Stop with the branch ready for a PR; do not merge, tag or deploy.

### `/goal` prompt

```text
/goal Ship v1.2 "Automatic Reminders" of Tally on branch release/v1.2-auto-reminders.

Read docs/release-plan.md before writing code. Follow "Rules for every release" and "Architecture: built to grow, readable without AI", then build everything in the "v1.2 — Automatic Reminders" section: every numbered Build step, every Quality item and any "Done when" items. UI must match docs/design/. If the plan and the code disagree, or a step is unclear, do the safe thing and list it under NEEDS YOUR DECISION.

Do not merge, tag or deploy; stop with the branch ready for a PR.

END YOUR RUN WITH EXACTLY:
STATUS: done | blocked (one line why)
CHECKS: lint ✓/✗, types ✓/✗, tests ✓/✗ (count), build ✓/✗
NEEDS YOUR DECISION: bullet list, or "none"
```

## v1.3 — Items & QR

**Goal:** the app knows *what* is being lent, not just a description, and a phone camera can issue or return an item by scanning its label. Branch `release/v1.3-items-qr`, tag `v1.3.0`.

**Done when:** an item catalogue exists with asset IDs, printable QR labels, scan-to-issue and scan-to-return, availability per item, and condition captured at issue and return.

### Build spec

**Context**

- The app is online (Supabase, organisations, roles, offline sync, audit log, Google Sheet mirror, automatic reminders). Add items through the existing repository pattern; store photos in Supabase Storage with per-organisation access.
- Inspect the repo first and summarise how loans, line items and migrations work today.

**Design**

- Read everything in docs/design/ before building UI and match it (layout, spacing, type, colours, components). Screens without a reference: reuse the closest existing pattern and list them under NEEDS YOUR DECISION. No new visual style.
- Responsive: check desktop (1280px+) and phone (375px). The Scan button is one click or tap from the dashboard.

**Build**

0. Follow docs/architecture.md: add this as src/features/items with its own domain, data (ItemRepository) and ui, exposed via index.ts. Do not reach into other features' internals; extend through their index.ts. Add an ADR for any new pattern and update docs/architecture.md and README.md.
1. Item catalogue: items have assetId (auto, e.g. ITM-0001, editable), name, category, location, serial number (optional), replacement value (ZAR, optional), photo (optional, compressed client-side to under 200 KB), quantity owned (for non-serialised items like cables), status (available | on loan | damaged | missing | retired) and notes. CRUD screens with search and category filter; category and location lists editable in Settings.
2. Link loans to items: a loan line can reference a catalogue item (or stay free-text for backwards compatibility). Availability = owned minus out on loan; block issuing more than is available, with a clear message.
3. Migration: offer "Create catalogue items from past loan descriptions" as an optional step with a review list; never auto-merge silently.
4. QR labels: generate a QR per item encoding its assetId. Print view: a sheet of labels (A4, 3x8 grid) with QR, assetId and name; also print a single label.
5. Scanning: camera scanner (library such as @zxing/browser or html5-qrcode) that reads QR and common 1D barcodes. Scan-to-issue: scan one or more items into a new loan cart, then pick the borrower. Scan-to-return: scan an item, show its open loan, confirm return. Manual assetId entry fallback when the camera is denied.
6. Condition: capture condition (good | fair | damaged) and an optional note/photo at issue and at return. A return marked damaged or a "report missing" action updates item status and appears in a Damaged & Missing list on the dashboard.
7. Include items, photos and conditions in exports (separate items.csv) and add asset ID and condition columns to the Google Sheet mirror.

**Quality**

- Tests: availability maths, linking existing loans to new items, export with items, QR payload encode/decode.
- Lint, type-check, tests and build pass. CHANGELOG.md v1.3.0 section; package.json 1.3.0.
- Conventional Commits with short bullet bodies. Stop with the branch ready for a PR; do not merge or tag.

### `/goal` prompt

```text
/goal Ship v1.3 "Items & QR" of Tally on branch release/v1.3-items-qr.

Read docs/release-plan.md before writing code. Follow "Rules for every release" and "Architecture: built to grow, readable without AI", then build everything in the "v1.3 — Items & QR" section: every numbered Build step, every Quality item and any "Done when" items. UI must match docs/design/. If the plan and the code disagree, or a step is unclear, do the safe thing and list it under NEEDS YOUR DECISION.

Do not merge, tag or deploy; stop with the branch ready for a PR.

END YOUR RUN WITH EXACTLY:
STATUS: done | blocked (one line why)
CHECKS: lint ✓/✗, types ✓/✗, tests ✓/✗ (count), build ✓/✗
NEEDS YOUR DECISION: bullet list, or "none"
```

## v1.4 — Reservations, Sign-off & Reports

**Goal:** items can be booked ahead without double-booking, borrowers sign for what they take and return, and managers get monthly reports without asking. Branch `release/v1.4-reserve-signoff-reports`, tag `v1.4.0`.

### Build spec

**Context**

- Inspect the repo first and summarise items, loans, the scheduler and the audit log.

**Design**

- Read everything in docs/design/ before building UI (availability calendar, reservation form, signature pad, reports) and match it. Screens without a reference: reuse the closest existing pattern and list them under NEEDS YOUR DECISION. No new visual style.
- Responsive: check desktop (1280px+) and phone (375px); the signature pad must work with a finger on a phone or tablet.

**Build**

0. Follow docs/architecture.md: add src/features/reservations and src/features/reports with their own domain, data and ui; double-booking and report rules are pure, unit-tested domain functions backed by database constraints. Add an ADR for any new pattern and update docs/architecture.md and README.md.
1. Reservations: book one or more items for a date range for a borrower. Prevent double-booking in the database (exclusion constraint on item + date range, quantity-aware for non-serialised items), not just in the UI. Converting a reservation into a loan is one tap on the day; no-shows auto-cancel after a configurable grace period.
2. Availability calendar: per item and per category, week and month views, showing loans, reservations and items out for damage.
3. Digital sign-off: at issue and at return, show the items, quantities, condition and return-policy text, capture the borrower's finger signature (and the staff member's name), timestamp it, and store the signature image privately. Generate a simple PDF receipt per loan that can be shared via WhatsApp.
4. Reports (admin, filterable by date range and department; each exportable to CSV/XLSX):
    - Overdue loans
    - Missing and damaged items, with replacement value totals
    - Most borrowed items
    - Monthly loan activity (issued, returned, overdue)
    - Item utilisation (days on loan / days owned)
    - Department summary
5. Scheduled reports: admins choose which reports are emailed monthly (1st of the month, 08:00 Africa/Johannesburg) using the v1.2 scheduler.

**Quality**

- Tests: double-booking constraint (incl. quantities), reservation-to-loan conversion, report queries against seeded data, signature storage permissions per organisation.
- Lint, type-check, tests and build pass. CHANGELOG.md v1.4.0; package.json 1.4.0.
- Conventional Commits with short bullet bodies. Stop with the branch ready for a PR; do not merge, tag or deploy.

### `/goal` prompt

```text
/goal Ship v1.4 "Reservations, Sign-off & Reports" of Tally on branch release/v1.4-reserve-signoff-reports.

Read docs/release-plan.md before writing code. Follow "Rules for every release" and "Architecture: built to grow, readable without AI", then build everything in the "v1.4 — Reservations, Sign-off & Reports" section: every numbered Build step, every Quality item and any "Done when" items. UI must match docs/design/. If the plan and the code disagree, or a step is unclear, do the safe thing and list it under NEEDS YOUR DECISION.

Do not merge, tag or deploy; stop with the branch ready for a PR.

END YOUR RUN WITH EXACTLY:
STATUS: done | blocked (one line why)
CHECKS: lint ✓/✗, types ✓/✗, tests ✓/✗ (count), build ✓/✗
NEEDS YOUR DECISION: bullet list, or "none"
```

## Parked until a user asks

| # | Feature | Bring it back when |
| --- | --- | --- |
| 69 | Maintenance and repair tracking | An organisation services its own gear on a schedule |
| 74 | Waiting lists | Reservations (v1.4) show items are regularly fully booked |
| 77, 78 | Borrower self-service portal, online extension requests | Borrowers outnumber staff and ask to self-serve |
| 93 | Multi-branch / multi-location | One organisation runs more than one storeroom |
| 94 | Customisable fields | Two or more organisations need fields the app lacks |
| 99 | SMS notifications | Borrowers without WhatsApp become a real problem |
| 100 | Multi-language interface | A non-English-speaking organisation signs up |
| 101 | Offline-capable mobile workflows (installable app) | Staff start issuing loans from phones away from the desk |
| 106 | Public API integrations | Someone wants to connect another system |

## All 106 features (+ #107)

Every feature from the original list, plus your dad's live Google Sheet, with the release that delivers it.

| # | Feature | Release |
| --- | --- | --- |
| 1 | Loan item registration | v1.0 |
| 2 | Item description | v1.0 |
| 3 | Quantity tracking | v1.0 |
| 4 | Borrower/client name | v1.0 |
| 5 | Cellphone number | v1.0 |
| 6 | WhatsApp contact details | v1.0 |
| 7 | Loan start date | v1.0 |
| 8 | Expected return date | v1.0 |
| 9 | Section or department | v1.0 |
| 10 | Employee/work number | v1.0 |
| 11 | Issuing staff member | v1.0 |
| 12 | Loan record editing | v1.0 |
| 13 | Mark items as returned | v1.0 |
| 14 | Extend return dates | v1.0 |
| 15 | Automatic loan status calculation | v1.0 |
| 16 | Overdue loan identification | v1.0 |
| 17 | Due-today identification | v1.0 |
| 18 | Returned-item tracking | v1.0 |
| 19 | Dashboard summary | v1.0 |
| 20 | Search loan records | v1.0 |
| 21 | Filter loans by status | v1.0 |
| 22 | Sort loan records | v1.0 |
| 23 | WhatsApp reminder message preparation | v1.0 |
| 24 | Open WhatsApp with a pre-filled reminder | v1.0 |
| 25 | Loan notes and additional details | v1.0 |
| 26 | Overdue-day calculation | v1.0 |
| 27 | Extension indicator | v1.0 |
| 28 | Delete loan records | v1.0 |
| 29 | Reset loan registration form | v1.0 |
| 30 | Sample loan records (becomes "Load demo data") | v1.0 |
| 31 | Mobile-friendly interface | v1.0 |
| 32 | Browser-based operation | v1.0 |
| 33 | Local browser data storage (downloadable version) | v1.0 |
| 34 | CSV export compatible with Excel | v1.0 |
| 35 | Loan history through retained records | v1.0 |
| 36 | Automatic scheduled WhatsApp reminders | v1.2 |
| 37 | Pre-due-date reminders | v1.2 |
| 38 | Due-date reminders | v1.2 |
| 39 | Overdue follow-up reminders | v1.2 |
| 40 | Automatic cancellation of reminders after return | v1.2 |
| 41 | Reminder delivery status tracking | v1.2 |
| 42 | Failed-message notifications | v1.2 |
| 43 | WhatsApp opt-in and opt-out management | v1.0 |
| 44 | Shared online database | v1.1 |
| 45 | Multiple staff accounts | v1.1 |
| 46 | Role-based access permissions | v1.1 |
| 47 | Administrator dashboard | v1.1 |
| 48 | Centralised records across devices | v1.1 |
| 49 | Secure login and authentication | v1.1 |
| 50 | Automatic cloud backups (manual file in v1.0) | v1.0, v1.1 |
| 51 | Data recovery (restore file in v1.0) | v1.0, v1.1 |
| 52 | Excel register import | v1.0 |
| 53 | Bulk loan registration | v1.0 |
| 54 | Bulk item returns | v1.0 |
| 55 | Unique asset identification numbers | v1.3 |
| 56 | QR-code generation | v1.3 |
| 57 | Barcode scanning | v1.3 |
| 58 | Quick scan-to-issue | v1.3 |
| 59 | Quick scan-to-return | v1.3 |
| 60 | Individual asset records | v1.3 |
| 61 | Serial number tracking | v1.3 |
| 62 | Item photographs | v1.3 |
| 63 | Item category management | v1.3 |
| 64 | Item location tracking | v1.3 |
| 65 | Replacement value tracking | v1.3 |
| 66 | Item condition checks | v1.3 |
| 67 | Damage reporting | v1.3 |
| 68 | Missing-item reporting | v1.3 |
| 69 | Maintenance and repair tracking | Parked |
| 70 | Asset availability status | v1.3 |
| 71 | Reservation management | v1.4 |
| 72 | Availability calendar | v1.4 |
| 73 | Double-booking prevention | v1.4 |
| 74 | Waiting lists for unavailable items | Parked |
| 75 | Borrower profiles | v1.0 |
| 76 | Borrower loan history | v1.0 |
| 77 | Borrower self-service portal | Parked |
| 78 | Online extension requests | Parked |
| 79 | Digital issue acknowledgment | v1.4 |
| 80 | Digital return acknowledgment | v1.4 |
| 81 | Electronic signatures | v1.4 |
| 82 | Unique loan reference numbers | v1.0 |
| 83 | Date and time stamping | v1.0 |
| 84 | Staff activity log | v1.1 |
| 85 | Complete audit trail | v1.1 |
| 86 | Department-level reporting | v1.4 |
| 87 | Overdue-loan reports | v1.4 |
| 88 | Missing and damaged asset reports | v1.4 |
| 89 | Frequently borrowed item reports | v1.4 |
| 90 | Monthly loan activity reports | v1.4 |
| 91 | Asset utilisation reports | v1.4 |
| 92 | Scheduled management reports | v1.4 |
| 93 | Multi-branch and multi-location management | Parked |
| 94 | Customisable fields | Parked |
| 95 | Configurable return policies | v1.2 |
| 96 | Custom reminder schedules | v1.2 |
| 97 | Configurable notification templates | v1.0 |
| 98 | Email notifications | v1.2 |
| 99 | SMS notifications | Parked |
| 100 | Multi-language interface | Parked |
| 101 | Offline-capable mobile workflows | Parked |
| 102 | Secure synchronisation when back online | v1.1 |
| 103 | Data export and reporting options | v1.4 |
| 104 | User activity monitoring | v1.1 |
| 105 | Privacy and data-retention controls | v1.0 |
| 106 | Public API integrations | Parked |
| 107 | Live Google Sheet that updates itself (your dad's request) | v1.1 |

## Sources

- [Cheqroom: spreadsheet checkout workflow](https://www.cheqroom.com/blog/easy-equipment-checkout-system-with-spreadsheets/)
- [Cheqroom: why equipment tracking spreadsheets fail](https://www.cheqroom.com/blog/why-equipment-tracking-spreadsheets-fail/)
- [Cheqroom: 5 equipment tracking problems](https://www.cheqroom.com/blog/5-equipment-tracking-problems-spreadsheet-scares/)
- [Cheqroom: software vs spreadsheets](https://www.cheqroom.com/blog/equipment-management-software-why-is-it-better-than-spreadsheets/)
- [GoCodes: moving off spreadsheets](https://gocodes.com/?p=25652)
- [WhoHasGear on SourceForge](https://sourceforge.net/software/product/WhoHasGear/)
- [Lend Engine](https://www.lend-engine.com/)
- [Meta: WhatsApp Business Platform pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- [WhatsApp API rates by country (May 2026)](https://whautomate.com/whatsapp-business-api-pricing)
- [SME South Africa: staying POPIA-compliant](https://smesouthafrica.co.za/what-small-businesses-need-to-do-to-stay-popia-compliant/)
- [Eskom: POPIA overview](https://www.eskom.co.za/paia-popia/protection-of-personal-information-act-popia/)