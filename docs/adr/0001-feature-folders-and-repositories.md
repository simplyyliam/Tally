# ADR 0001: Feature folders, widgets and repositories

Date: 2026-10-29 · Status: accepted

## Context

Tally starts local-first (browser storage, no login) but the roadmap adds an
online database (v1.1), automatic reminders (v1.2), items (v1.3) and reports
(v1.4). We want each release to add folders, not rewrite screens.

## Decision

1. **Layers**: `app → widgets → features → shared`. A layer may only import
   layers to its right.
   - `features/<name>` owns one idea (loans, borrowers, reminders…) with
     `domain/` (pure rules), `data/` (repository interface + implementations)
     and `ui/` (small components). Its `index.ts` is the only door in.
   - `widgets/<name>/<name>.tsx` are the parent screens that put several
     features together (the dashboard, the loan register, the settings page).
   - `app/` holds routing, providers and the one file that picks storage.
   - `shared/` is feature-agnostic: design-system components, dates, phone
     numbers, CSV, the local document store and migrations.
2. **Pure domain**: status, overdue days and partial returns are plain
   TypeScript functions with unit tests. No React, no storage.
3. **Repositories**: screens call `LoanRepository`, `BorrowerRepository`,
   `SettingsRepository`… never `localStorage`. Interfaces are async so an
   online implementation fits without changing callers.
4. **Channels**: reminders go through `ReminderChannel`. v1.0 has a wa.me
   implementation; v1.2 adds WhatsApp Cloud API and email.
5. **Validated boundaries**: one Zod schema per entity checks everything read
   from storage, backups and imports.
6. **Lint enforces the rules** (oxlint `no-restricted-imports`), so nobody has
   to remember them.

## Consequences

- v1.1 adds `Supabase*Repository` classes and changes `src/app/repositories.ts`.
- Some wiring happens in widgets (e.g. the loan form gets borrower suggestions
  from the borrowers feature through a widget), which is a little more code
  than importing directly but keeps features independent.
- The plan named ESLint; the project already used oxlint, so the same rules
  are expressed in `.oxlintrc.json` instead.
