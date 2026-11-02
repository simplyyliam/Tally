# ADR 0002: shadcn components only

Date: 2026-11-02 · Status: accepted

## Context

Tally needs to look consistent, stay accessible, and be easy to change by someone without a
design background. Hand-made components drift apart over time, and edited copies of library
components are hard to upgrade.

## Decision

1. All UI is built from shadcn/ui components (Base UI primitives), added with
   `npx shadcn add <name>`.
2. Files in `src/components/ui` and `src/hooks` are never edited. Look and layout come from
   `className` and the theme tokens in `src/index.css`. The original shadcn `:root` and `.dark`
   theme is kept, and Tally's tokens are added after it.
3. A custom component is written only when shadcn has nothing like it. Today that is
   `shared/ui/`: the floating bulk-action bar, the timeline, the animated number, the shimmer
   text, the page header layout, and shadcn's date-picker recipe. No wrapper components
   re-export shadcn pieces.
4. Screens match the reference images in `docs/design/`.

## Consequences

- Upgrading shadcn means re-running `shadcn add` with nothing to merge by hand.
- Some class strings are long, because styling lives at the call site.
- `docs/design/` is gitignored, so the references exist only on the developer's machine.
