---
description: Remove noise comments and shorten long ones to one line
argument-hint: "[path, default: whole repo]"
---

Clean comments in `$ARGUMENTS` (whole repo if empty). Change **only comments** — no code.

For each comment:
- **Delete** if it narrates the code (`// get user`, `// loop items`), restates a name or type, is a changelog note (`// fixed #42`, `// added by AI`), a section banner, or commented-out code.
- **Shorten to one line (~3–8 words)** if it explains a real *why*, gotcha, business rule or workaround.
- **Keep** short, useful ones, and `TODO`s with an owner/reason.
- Doc comments on exported functions: one line max, or none if the name says it. Drop `@param`/`@returns` boilerplate that adds nothing. Keep doc comments a linter or doc generator requires.

Example: a 6-line paragraph on why an endpoint is "advisory" → `// Advisory only; order re-checks server-side.`

Work folder by folder, < ~300 changed lines per step. The diff must contain only comment lines — verify with the build/tests anyway.
Safety: clean git tree, branch `deslop/comments-<folder>`, one commit per folder, hand-off summary (folders done, comments removed/shortened), then stop and ask to continue.
