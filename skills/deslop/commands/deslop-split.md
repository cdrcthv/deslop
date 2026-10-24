---
description: Split long files and long functions into smaller, well-named ones
argument-hint: "[file or path, default: worst offenders]"
---

Shorten long code in `$ARGUMENTS`. If empty, measure sizes as in /deslop-audit and take the 5 worst files.

**Phase 1 — plan (no edits).** For each file over ~300 lines or function over ~40 lines, propose:

```
web/checkout/CheckoutPage.vue (612 lines) → 3 files
  - CheckoutPage.vue — layout only (~150)
  - AddressForm.vue — address fields + validation (~180)
  - useCheckout.ts — state, submit, totals (~200)
```

Split by **responsibility**, not by line count. New files go next to the original (same feature folder), named for what they do. Ask before starting.

**Phase 2 — one file per step.**
- Pure move/extract: no logic changes, no renames beyond the new pieces, no "improvements" on the way.
- Long functions: extract named steps; use early returns to cut nesting.
- Update imports; keep public API identical.

Safety: clean git tree, branch `deslop/split-<file>`, tests before/after, < ~300 lines per step (moved code counts), one commit, hand-off summary, then stop.
