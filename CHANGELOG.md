# Changelog

## Unreleased

- Renamed the ledger data-model concept to `Book` (`Book`, `BookId`, `BookEntry`, `BookLine`, `BookSummary`, `openBook`, and the `bookId` property). The `src/ledger/` directory name is intentionally unchanged.

## 0.4.1

- Settlement retries once when the region service times out.
- Report job reads `LEDGER_TIMEOUT_MS` instead of a hardcoded 5000.

## 0.4.0

- Added `POST /invoices`.
- Fee schedules are keyed by `LEDGER_REGION`.
