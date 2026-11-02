# Tally architecture

This explains where code lives and the rules that keep it tidy. It is written
to be followed without AI.

## The layers

```text
src/
  app/          routes, providers, and repositories.ts (picks local vs online storage)
  widgets/      parent screens that compose features: widgets/<name>/<name>.tsx
  features/
    loans/      domain/ data/ ui/ index.ts (also the activity log and retention rules)
    borrowers/  derived borrowers, WhatsApp consent
    reminders/  ReminderChannel + wa.me implementation, message template
    import/     Excel/CSV parsing, column mapping, validation
    backup/     backup file, restore, 7-day reminder
    demo/       sample loans (Settings)
    settings/   staff name, reminder template
  shared/
    ui/         design-system components (from docs/design)
    lib/        dates (Africa/Johannesburg), ids, phone, csv, small helpers
    schema/     the local document store, storage version and migrations
```

Imports only point **down** this list: `app → widgets → features → shared`.

| Rule | Why | Enforced by |
| --- | --- | --- |
| A feature imports another feature only via its `index.ts` | Internals can change freely | `.oxlintrc.json` |
| `domain/` has no React, no storage, no `window` | Rules stay testable and never change when UI or storage does | `.oxlintrc.json` |
| Features never import widgets or app | Features stay reusable building blocks | `.oxlintrc.json` |
| `shared/` never imports features | Shared code stays generic | `.oxlintrc.json` |
| Screens use repositories, never `localStorage` | v1.1 swaps storage in one file | code review + lint on domain |

## Where does new code go?

- **A new business rule** (e.g. "a reservation can't overlap a loan"): a pure
  function in `features/<name>/domain/`, with a `*.test.ts` next to it that reads
  like a sentence.
- **A new kind of record**: a Zod schema in `domain/`, a repository interface in
  `data/`, a local implementation, and a provider + hook (`*-context.tsx`).
- **A new screen**: `widgets/<name>/<name>.tsx`, routed in `app/app.tsx`.
- **A reusable visual piece**: `shared/ui/`, matching `docs/design/`.

## Data and safety

- Everything is one JSON document in `localStorage` under `tally.register`,
  split into sections (`loans`, `settings`, …). See `shared/schema/local-document.ts`.
- A record that fails validation is moved to a `quarantine` section, never deleted.
- Writes that the browser refuses (storage full) raise an error the UI shows.
- Other tabs are kept in sync via the `storage` event, so a stale tab can't
  overwrite newer data.

## Sections in the document

| Section | Owner | Notes |
| --- | --- | --- |
| `loans`, `loanReferenceCounters`, `quarantine` | `features/loans` | Counters keep `LN-` numbers from ever being reused |
| `activity` | `features/loans` (`ActivityRepository`) | Append-only; removed only with purged or demo loans |
| `borrowerPreferences` | `features/borrowers` | WhatsApp consent; default is "yes" |
| `settings` | `features/settings` | Staff name, reminder template (empty = built-in text) |
| `meta` | `features/backup` | Last backup time |

Why it's built this way: [ADR 0003](adr/0003-local-first-storage-and-migrations.md). UI rules:
[ADR 0002](adr/0002-shadcn-only-ui.md).

## Dates

All "today" logic uses Africa/Johannesburg (`shared/lib/dates.ts`). Calendar
dates are stored as `YYYY-MM-DD`; moments (created, returned) as ISO timestamps.
