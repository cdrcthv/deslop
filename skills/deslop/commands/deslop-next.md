---
description: Do the next unchecked item from .deslop/audit.md, then stop
argument-hint: "[item number, default: next unchecked]"
---

Open `.deslop/audit.md`. If it doesn't exist, say so and suggest `/deslop-audit` first.

Pick item `$ARGUMENTS`, or the first unchecked `- [ ]` item if empty. Do **only that item**, by following the instructions of the command it names (`/deslop-dupes`, `/deslop-comments`, `/deslop-split`, …) on its scope.

Safety (always):
- Git tree must be clean; else stop and ask. Work on branch `deslop/<item-slug>`.
- Run build + tests before and after. Behavior must not change.
- Stay under ~300 changed lines. If the item is bigger, split it in the audit file and do the first part.
- One commit, one-line message.

Then tick the item (`- [x]`) in `.deslop/audit.md`, show the short hand-off summary (files, +/-, what to look at, how to test), and stop.
