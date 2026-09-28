# Ledger Service Release

Release date: 2026-09-28

This release delivers the changes tracked under ticket LD-4412, addressing outstanding work in the ledger service. The shipped change is recorded in the pull request at https://cursor.com/codebase/anysphere/ledger-a/pull/1, which captures the full detail of what was modified and reviewed before deployment.

The update focuses on stabilising ledger behaviour and refining how entries are processed, with attention paid to consistency and correctness across the service. We have prioritised a smooth upgrade path so that existing behaviour is preserved wherever possible, and the work has been validated against our continuous integration pipeline prior to release.

## Rollback

Should this release cause unexpected behaviour, roll back by reverting the pull request referenced above and redeploying the previous known-good build. Restore the prior tagged version, confirm the service starts cleanly, and verify that ledger entries reconcile as expected before declaring the rollback complete. No data migration accompanies this change, so reverting the code is sufficient to return the service to its earlier state.

Signed off by Ops.
