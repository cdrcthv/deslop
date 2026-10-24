---
description: Find duplicate and near-duplicate functions; merge them into shared helpers
argument-hint: "[path, default: whole repo]"
---

Find duplicated logic in `$ARGUMENTS` (whole repo if empty) and merge it into single shared helpers.

**Phase 1 — inventory (no edits).**
- List every function/method/component with its file and one-line purpose. Use a duplication tool if installed (`npx jscpd`, `dupl` for Go, IDE inspections); otherwise compare by name verbs/nouns (`format`, `parse`, `price`, `date`, `validate`, `slug`, `round`, `fetch`…) and by body.
- Also check the standard library and installed deps: hand-written code that `Intl`, `strings`, LINQ, `date-fns`… already does counts as a duplicate.
- Output groups:

```
Group 1: money formatting (4 copies)
  - web/cart/total.ts:12 fmtEur()
  - web/invoice/pdf.ts:40 formatPrice()
  - ...
  Differences: currency symbol, decimals
  Proposal: lib/money.ts formatMoney(amount, currency, locale)
```

Show all groups, biggest first, and ask which to do.

**Phase 2 — merge, one group per step.**
- Reuse the best existing copy if one exists; otherwise create one topic-named helper file (`lib/money.ts`), never a giant `utils`.
- Parameterize what differed. Keep each caller's exact behavior (check edge cases: rounding, null, empty).
- Replace callers, delete the copies.
- Add/adjust a small test for the helper.

Safety: clean git tree, branch `deslop/dupes-<topic>`, tests before/after, < ~300 lines per step, one commit, hand-off summary, then stop.
