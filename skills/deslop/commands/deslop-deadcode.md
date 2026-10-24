---
description: Find and delete unused functions, files, exports and dependencies
argument-hint: "[path, default: whole repo]"
---

Find dead code in `$ARGUMENTS` (whole repo if empty).

**Phase 1 — list (no edits).** Use tools if available (`npx knip` or `ts-prune` for TS/Vue, `staticcheck`/`deadcode` for Go, IDE "unused" inspections, `vulture` for Python); otherwise grep each exported symbol for references.

Report in three buckets:
- **Safe**: no references anywhere.
- **Check**: referenced only by tests, or possibly used via reflection, routing, DI, templates, config, CLI flags, public API.
- **Deps**: packages in the manifest never imported.

Ask before deleting. Never delete the "Check" bucket without explicit confirmation per item.

**Phase 2 — delete, a batch per step.** Delete, don't comment out. Remove now-unused imports. Run build + tests.

Safety: clean git tree, branch `deslop/deadcode-<area>`, < ~300 lines per step, one commit, hand-off summary, then stop.
