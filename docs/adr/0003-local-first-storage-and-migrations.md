# ADR 0003: Local-first storage with versioned migrations

Date: 2026-11-02 · Status: accepted

## Context

v1.0 must work without a server, login or internet, on a desktop or phone browser, and must
never lose a record. Online storage arrives in v1.1.

## Decision

1. **One document in `localStorage`** under `tally.register`, split into sections: `loans`,
   `loanReferenceCounters`, `borrowerPreferences`, `settings`, `activity`, `meta` and
   `quarantine`. Each feature's local repository owns its section and validates it with its own
   Zod schema (`shared/schema/local-document.ts`).
2. **A `schemaVersion` on the document.** On load, older documents are upgraded step by step
   (`shared/schema/migrations.ts`). Each step has a test that loads the previous version's data.
   The original text is kept under `tally.register.before-v<N>`.
3. **Additive changes need no new version.** A new optional field with a Zod default (for
   example `settings.reminderTemplate`) or a new section (for example `activity`) still loads in
   older documents without a step.
4. **Nothing is silently dropped.** Invalid records move to `quarantine`. Unreadable JSON is
   copied aside. Data written by a newer version opens read-only.
5. **Backups are the whole document**, so a restore brings back every section, and restoring an
   older backup runs the same migrations.
6. **Hash routing and a single-file build** (`build:offline`) let the app open from `file://`
   with no network.

## Consequences

- Storage is limited to what the browser allows, about 5 MB, which is years of loans. A
  refused write shows an error and asks for a backup.
- Data lives on one device until v1.1. Backup and restore is how it moves between devices.
- v1.1 swaps the repositories in `src/app/repositories.ts`. The migrations become the import
  path into the online database.
