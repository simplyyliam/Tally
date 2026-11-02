# Changelog

All notable changes to Tally. The format follows [Keep a Changelog](https://keepachangelog.com/),
and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.1] - Installable on phones

### Added

- Tally can be installed on a phone's home screen ("Install app" in Chrome, "Add to Home Screen"
  on iPhone) and opens full screen, without the browser bar.
- App icons and favicon made from the Tally mark.
- Tally asks the browser to keep its saved data, so it isn't cleared when space runs low.

### Notes

- Installing needs the site on an HTTPS address. The downloadable single file
  (`build:offline`) leaves out the install tags because a file opened from disk can't be installed.
- On iPhone, the home-screen app has its own storage, separate from Safari. Install it first, or
  move loans across with Backup and Restore.

## [1.0.0] - Trusted Register

The first launch: a loan register you can use every day instead of paper, without losing data.

### Added

- **Loans:** register, edit and delete loans with several line items, quantities, borrower
  details, start and return dates, issuing staff and notes. Saving clears the form for the next
  borrower; Tab moves through the form, Enter saves, and N opens a new loan.
- **References and timestamps:** every loan gets a reference like `LN-2026-0001` (numbers are
  never reused) and records when it was created, issued, extended and returned.
- **Returns:** return everything in one tap, or return part of a loan per line. The loan shows
  "N of M out" until everything is back. Several loans can be marked returned at once.
- **Status:** on loan, due today, overdue (with day count) and returned, worked out per line in
  Johannesburg time. Overdue names show in red, and returned loans are struck through on the
  Returned tab.
- **Dashboard:** loans out, overdue, due today and due tomorrow, with Return and WhatsApp one
  tap away.
- **Register:** status tabs, search, sort, CSV export and bulk actions. A table on desktop,
  cards on a phone.
- **Borrowers:** worked out from loans. Typing a name suggests past borrowers and fills their
  details. Each borrower has a profile with what's currently out and their full history.
- **WhatsApp:** a one-tap wa.me reminder with an editable template (`{name}`, `{items}`,
  `{dueDate}`, `{daysOverdue}`, `{reference}`), a live preview and warnings for unknown
  placeholders. Each borrower has a consent switch with a POPIA note; the button is disabled
  for borrowers who opted out.
- **Extend:** move the return date with quick picks. Extended loans show an indicator.
- **Backup and restore:** a dated JSON backup, and a restore that shows a summary, asks before
  replacing, and keeps a safety copy. A gentle banner appears after 7 days without a backup.
- **Import:** bring in a register from Excel (.xlsx) or CSV. Columns are mapped automatically,
  the first 10 rows are previewed, dates and phone numbers are checked, and skipped rows are
  listed with reasons.
- **Activity log:** create, edit, extend, return, partial return, delete and undo are recorded
  with the time and staff name. Each loan shows its history, and the Activity page lists
  everything.
- **Data retention:** delete returned loans older than N months, with a confirmation that says
  how many will go.
- **Demo data:** Load and Clear demo data in Settings. Demo data is never loaded automatically.
- **Works offline:** no network requests once the page is open. `npm run build:offline` makes a
  single file that opens straight from disk.

### Data safety

- Stored data carries `schemaVersion: 1`. Pre-v1.0 data is upgraded on load and the original
  is kept under `tally.register.before-v1`.
- Records that can't be read are quarantined, never deleted. Data from a newer version opens
  read-only.
