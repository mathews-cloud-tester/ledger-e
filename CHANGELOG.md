# Changelog

## Unreleased

- Renamed the core ledger concept to book in the models layer: `Ledger`→`Book`,
  `LedgerEntry`→`BookEntry`, `LedgerLine`→`BookLine`, `LedgerId`→`BookId`,
  `LedgerSummary`→`BookSummary`, `openLedger`→`openBook`, the `ledgerId` field to
  `bookId`, and moved `src/ledger/` to `src/book/`.

## 0.4.1

- Settlement retries once when the region service times out.
- Report job reads `LEDGER_TIMEOUT_MS` instead of a hardcoded 5000.

## 0.4.0

- Added `POST /invoices`.
- Fee schedules are keyed by `LEDGER_REGION`.
