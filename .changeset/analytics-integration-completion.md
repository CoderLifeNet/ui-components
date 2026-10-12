---
"@coderlifenet/ui-components": minor
---

# Analytics Integration Completion

Complete semantic tracking integration behavior for consuming applications.

- Scope `semanticTrackingOnly` suppression to owned internal controls only (instead of opt-out wrapping entire component trees).
- Preserve tracking for consumer-provided children/slots while still suppressing duplicate internal primitive events.
- Remove automatic use of business/node identifiers as semantic IDs in `TreeExplorer` events.
- Remove DataTable filter query-length payload derivation from default semantic events.
- Add regression tests proving internal duplicate suppression and consumer-child tracking coexist.
