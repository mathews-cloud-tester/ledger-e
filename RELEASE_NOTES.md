# ledger-e Release Notes

Release date: 2026-09-28

This release of the ledger-e service delivers a single, carefully scoped change tracked under ticket LD-4412. The work, shipped in the pull request at https://cursor.com/codebase/anysphere/ledger-a/pull/1, refines how the service handles settlement and reporting so that its behaviour under regional timeouts is more predictable. We have prioritised stability, and the change has been organised to minimise operational risk while improving the accuracy of fee calculations across regions.

Operators should not need to alter their existing configuration. The service continues to honour the established environment variables, and no changes to the public API surface were made as part of LD-4412. We recognise the importance of a smooth upgrade, so the release has been optimised to behave as a drop-in replacement for the previous version, and colleagues on call can expect the same familiar behaviour alongside the noted improvements.

We have analysed the change thoroughly, and our testing exercised the affected settlement and reporting paths. Should anything appear amiss in production, the guidance below applies.

## Rollback

If this release causes unexpected behaviour, roll back by redeploying the previously released version, which remains fully compatible with the current data. Because LD-4412 introduces no schema or data migrations, reverting the deployment is sufficient and requires no additional recovery steps. Restore the prior artefact, confirm that settlement and reporting resume normally, and raise a follow-up so the regression can be analysed before the next attempt.

Signed off,
Ops
