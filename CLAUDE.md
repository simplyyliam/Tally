# CLAUDE.md

Notes for AI assistants (and people) working on Tally. Read `docs/architecture.md` first.

## What this is

A local-first loan register: React 19 + Vite + TypeScript, shadcn/ui (Base UI), Tailwind v4,
Zod, Vitest, oxlint. Everything is stored in the browser (`localStorage`, one document under
`tally.register`). No backend, no login. The roadmap lives in `docs/release/release-plan.md`.

## Commands

```bash
npm run dev            # http://localhost:5173
npm run check          # lint + typecheck + tests + build; must be green before every commit
npm run build:offline  # single self-contained dist-offline/index.html (opens from file://)
```

## Rules

- **Layers:** `app → widgets → features → shared`. Import another feature only through its
  `index.ts`. `domain/` is pure TypeScript (no React, storage or `window`). Lint enforces this.
- **UI is shadcn only.** Add components with `npx shadcn add <name>` and answer "n" to overwrite
  prompts. Never edit `src/components/ui` or `src/hooks`. Style with `className`. Write custom UI
  only when shadcn has nothing like it (see `shared/ui/`).
- **Design:** match `docs/design/` (gitignored, local reference images). Flush sidebar, modest
  corners, compact header buttons, a sliding grey pill on the active tab, soft tinted badges
  (`shared/lib/tones.ts`).
- **Storage goes through repositories** chosen in `src/app/repositories.ts`. Screens never touch
  `localStorage`.
- **Never lose a record.** A change to the stored shape bumps `CURRENT_SCHEMA_VERSION` in
  `shared/schema/migrations.ts`, adds a step, and adds a test that loads the previous version.
  Additive optional fields with Zod defaults don't need a bump.
- **Dates:** use `shared/lib/dates.ts` (Africa/Johannesburg). Calendar dates are `YYYY-MM-DD`.
- **Style:** plain names, files under ~250 lines, comments explain why. Domain tests read as
  sentences.
- **Git:** one `release/vX.Y-<name>` branch per release. Cut `feature/*`, `fix/*` or `docs/*`
  branches from it and merge them back with `--no-ff`. Use Conventional Commits with short
  bullet-point bodies. Never merge to `main`, tag or deploy without being asked.

## Where things are

| Need | Look in |
| --- | --- |
| Loan status, overdue, partial returns | `features/loans/domain/status.ts`, `changes.ts` |
| Activity log, retention | `features/loans/domain/activity.ts`, `retention.ts` |
| Borrowers and WhatsApp consent | `features/borrowers/` |
| Reminder text and the wa.me link | `features/reminders/` |
| Excel/CSV import | `features/import/` |
| Backup and restore | `features/backup/` |
| Demo data | `features/demo/` |
| Migrations and the document store | `shared/schema/` |
| Screens | `widgets/<name>/<name>.tsx`, routed in `app/app.tsx` |
