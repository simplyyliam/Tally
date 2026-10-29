# Tally ☕

A loan register that answers one question reliably: **who has it?**

Local-first: everything is saved in this browser. No login, no server, no monthly cost.

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

## Structure

`app → widgets → features → shared`. See [docs/architecture.md](docs/architecture.md)
for the rules and [docs/adr/](docs/adr/) for why.

## Keyboard

- **N**: new loan
- **Ctrl/⌘ + K**: search loans
- **Enter**: save the loan form
