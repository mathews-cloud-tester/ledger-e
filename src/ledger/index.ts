// Backward-compatible re-export for the API layer, which still imports the
// core from `src/ledger/`. The API rename is out of scope for this stack, so
// this shim stays until that layer is migrated to `src/book/`.
export { applyFee, feeScheduleFor, balanceFor, feesOwedBy, type FeeSchedule, type Ledger } from "../book/index.ts";
