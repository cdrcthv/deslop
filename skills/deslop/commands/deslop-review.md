---
description: Review the current branch or diff for human reviewability before merging
argument-hint: "[base branch or commit range, default: main]"
---

Review the changes of the current branch against `$ARGUMENTS` (default `main`, or `master` if no `main`). Include uncommitted changes. **Don't edit anything.**

Use `git diff --stat` and `git diff` against the merge base. Check, in order:
1. **Size & scope** — total changed lines, files; one concern or mixed?
2. **Duplication** — new functions that already exist in the repo (grep their verbs/nouns) or duplicate each other.
3. **Unrelated changes** — reformatting, renames, moves not needed for the task.
4. **Comments** — multi-line explanations, narration, changelog notes, commented-out code.
5. **Structure** — new files well named and placed? folders overflowing? files > ~300 / functions > ~40 lines?
6. **Over-engineering** — unrequested options, abstractions, dependencies.
7. **Correctness** — bugs, edge cases, missing tests.

Reply in this format, nothing longer:

```
Verdict: ready | needs changes | split first
Size: +X / -Y in N files — <ok | split into: 1. … 2. …>

Issues:
- path:line — problem → fix

Fine as-is: <short list>
```

Offer to fix the issues (one commit per kind of fix).
