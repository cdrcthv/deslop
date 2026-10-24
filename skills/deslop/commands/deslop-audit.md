---
description: Read-only audit of the codebase against human-reviewable rules; writes a prioritized plan
argument-hint: "[path, default: whole repo]"
---

Audit `$ARGUMENTS` (whole repo if empty) for human reviewability. **Do not change any code.**

1. Measure sizes: run `node <skill folder>/scripts/size_report.mjs $ARGUMENTS` if the deslop skill is installed and Node is available; otherwise count lines with your own file tools (don't assume bash — the user may be on Windows).
2. Scan for, and count:
   - Files over ~300 lines, functions over ~40 lines, folders over ~15 files
   - Duplicate or near-duplicate functions (same purpose, different files)
   - Long or narrating comments, changelog comments, commented-out code
   - Unused functions, exports, files, dependencies
   - Over-engineering: one-implementation interfaces, unused options, needless wrappers
   - Folders grouped by type (`handlers/`, `services/`) that should be by feature
3. Write `.deslop/audit.md` with this exact shape:

```
# Audit — <date> — <path>

Summary: <one line, worst problems first>

| Area | Count | Worst offenders |
|---|---|---|
| Long files | n | path (lines), ... |
| Long functions | n | ... |
| Crowded folders | n | ... |
| Duplicates | n groups | ... |
| Comment noise | n files | ... |
| Dead code | n | ... |
| Over-engineering | n | ... |

## Plan (each item = one small PR, < ~300 lines)
- [ ] 1. <command> <scope> — <why> (~lines)
- [ ] 2. ...
```

Order the plan: dead code → duplicates → comments → splits → structure → simplify (deleting first makes everything after smaller).

4. Reply with the summary table and the first 5 plan items only. Suggest `/deslop-next` to start.
