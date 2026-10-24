# Reviewing a PR / MR with these rules

Use when asked to review a change, or to clean up an AI-generated diff
before it's merged.

## Output format

Keep it scannable. Verdict first.

```
Verdict: needs changes (diff too large, 2 duplicated helpers)

Size: 1,140 lines across 23 files → split into ~4 PRs:
  1. shared money helper (refactor)
  2. VAT endpoint
  3. checkout UI
  4. tests

Issues:
- billing/vat/handler.go:12–40 — 28-line comment → one line
- checkout/price.ts:8 — reimplements formatMoney() from lib/money.ts
- cart/total.ts:15 — same rounding logic as invoice/total.ts → extract
- handlers/ now 31 files → group by feature
- package.json — new dep `lodash` used once; stdlib does it

Fine as-is: tests, error handling in vies_client.go
```

## What to check, in order

1. **Size & scope** — one concern? Under ~300 lines? Mixed refactor + feature?
2. **Duplication** — grep the new function names' verbs/nouns; does it already
   exist? Same logic in two new places?
3. **Unrelated changes** — reformatting, renames, moved code not needed for
   the task.
4. **Comments** — essays, narration, changelog notes, commented-out code.
5. **Structure** — new files well named and placed? Folder overflowing?
   Files/functions too long?
6. **Over-engineering** — unused options, interfaces with one implementation,
   abstraction "for later", new dependencies.
7. **Correctness** — only now, on the smaller, cleaner diff.

## When asked to fix the PR

Fix in this order, each as its own commit:
1. Revert unrelated changes.
2. Replace duplicates with existing helpers (or extract one).
3. Trim comments.
4. Restructure files/folders if needed.
Then re-present with the hand-off summary from SKILL.md.
