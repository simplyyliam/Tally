# Tally ☕

A loan register that answers one question reliably: **who has it?**

Local-first: everything is saved in this browser. No login, no server, no monthly cost.
Version 1.0 "Trusted Register": multi-item loans with partial returns, borrower profiles,
WhatsApp reminders with consent, backup and restore, Excel/CSV import, an activity log, data
retention and demo data. See [CHANGELOG.md](CHANGELOG.md).

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

## Check it

```bash
npm run lint           # oxlint, including the architecture boundary rules
npm run typecheck      # TypeScript
npm test               # unit tests (Vitest)
npm run build          # production build in dist/
npm run check          # all of the above
```

## Downloadable version

```bash
npm run build:offline  # dist-offline/index.html: one file, opens from disk, no internet needed
```

## Try it with sample data

Settings → **Load demo data**. **Clear demo data** removes only the sample loans.

## Structure

`app → widgets → features → shared`. See [docs/architecture.md](docs/architecture.md)
for the rules, [docs/adr/](docs/adr/) for why, [DECISIONS.md](DECISIONS.md) for calls made
during v1.0, and [CLAUDE.md](CLAUDE.md) for working conventions.

## Keyboard

- **N**: new loan
- **Ctrl/⌘ + K**: search loans
- **Enter**: save the loan form
