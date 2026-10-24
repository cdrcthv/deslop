---
description: Reorganize crowded type-based folders into feature folders
argument-hint: "[folder, default: most crowded]"
---

Restructure `$ARGUMENTS` (if empty, the most crowded folder from `size_report.mjs`, see /deslop-audit) so a human finds things at a glance.

**Phase 1 — proposal (no edits).**
- Read the project's existing conventions and framework rules first (routing by file path, Go package rules, .NET namespaces, Nuxt/Next conventions). Never break framework-required locations.
- Propose a tree grouped by **feature/domain**, then by type inside (`billing/vat/handler.go`, `features/cart/useCart.ts`). Aim ≤ ~10–15 files per folder.
- Show before → after as two short trees plus a move list. Flag risky moves (circular imports, public import paths, generated code, config pointing at paths).
- Ask before moving anything.

**Phase 2 — one feature group per step.**
- Use `git mv` so history follows.
- Only move + fix imports/package names/namespaces. No code edits otherwise.
- Build and tests must pass after each group.

Safety: clean git tree, branch `deslop/structure-<feature>`, < ~300 changed lines per step (renames count as small if pure), one commit per group, hand-off summary, then stop.
