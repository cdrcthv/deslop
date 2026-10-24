# Commands — when to run what

All commands except `/deslop-review` and `/deslop-audit` work in two phases:
**list first (no edits) → you pick → fix one small step → stop.**
Every fix step: clean git tree, own branch, tests before/after,
< ~300 lines, one commit. You stay in control at every step.

| Command | Does | Run it |
|---|---|---|
| `/deslop-audit [path]` | Read-only scan; writes `.deslop/audit.md` with a prioritized plan | First time on a project; then monthly |
| `/deslop-next [n]` | Does the next item of the audit plan, then stops | Whenever you have 10 minutes |
| `/deslop-review [base]` | Reviews current branch before merge | Before every PR/MR merge |
| `/deslop-deadcode [path]` | Unused functions, files, exports, deps | After a big feature; monthly |
| `/deslop-dupes [path]` | Duplicate functions → shared helpers | After a few AI sessions; monthly |
| `/deslop-comments [path]` | Deletes noise, shortens long comments | After any AI-heavy session |
| `/deslop-split [file]` | Long files/functions → smaller ones | When a file passes ~300 lines |
| `/deslop-structure [folder]` | Type folders → feature folders | When a folder passes ~15 files |
| `/deslop-simplify [path]` | Removes needless abstraction | Quarterly, or when code "feels heavy" |

## Recommended routines

**First cleanup of an existing project**
1. `/deslop-audit`
2. `/deslop-next` repeatedly (the plan already orders it: dead code → duplicates → comments → splits → structure → simplify — deleting first makes the rest smaller)

**Every PR/MR**
`/deslop-review` → fix what it finds → merge.

**After a long vibe-coding session**
`/deslop-comments <changed folder>` then `/deslop-dupes <changed folder>`.

**Monthly**
`/deslop-audit` again and compare with the previous `.deslop/audit.md` (it's in git).

Tip: scope commands to a folder (`/deslop-dupes web/src/features/cart`) on big
repos — results are faster and diffs smaller.
