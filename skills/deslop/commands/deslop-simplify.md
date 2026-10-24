---
description: Remove over-engineering — needless abstractions, wrappers, options and deps
argument-hint: "[path, default: whole repo]"
---

Look for over-engineering in `$ARGUMENTS` (whole repo if empty):
- Interfaces/abstract classes with a single implementation and no test seam need
- Wrappers that only forward to another function
- Factories, builders, managers, "services" with one trivial method
- Config options, flags and parameters never set to anything but the default
- Generic code used with one type only
- Defensive checks for impossible states; try/catch that only rethrows
- Dependencies replaceable by a few lines of stdlib
- Deep nesting that early returns would flatten

**Phase 1 — list (no edits).** For each: location, what to do, lines saved, risk. Biggest win first. Ask which to do.

**Phase 2 — one item per step.** Keep behavior identical. Inline or delete, update callers.

Safety: clean git tree, branch `deslop/simplify-<item>`, tests before/after, < ~300 lines per step, one commit, hand-off summary, then stop.
