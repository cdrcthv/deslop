---
name: deslop
description: Write code a human can review in seconds — small diffs, reuse before writing, short comments, clear file and folder structure. Use this skill for ANY coding task (frontend, backend, infra, scripts) — writing features, fixing bugs, refactoring, adding endpoints or components — even if the user doesn't mention reviewability. Especially use it when the user complains about huge diffs, duplicated helpers, long AI comments, messy folders, or says they "can't review what the AI wrote".
---

# Deslop

Stop AI slop: write code a human can review in seconds.

The person you work for must stay in control of their codebase. If they can't
read your change in a minute or two, they will either skip the review and
merge blindly, or reject everything. Both are failures, even if the code works.

Your goal is not "code that works". It is **code that works and that a human
can verify works, quickly**. Optimize every change for the reviewer.

## The six rules

1. **Small changes.** One concern per change. Stop and check in often.
2. **Search before you write.** Reuse what exists. Never re-create it.
3. **Touch only what the task needs.** No drive-by rewrites.
4. **Short comments, or none.** Code explains *what*; comments only say *why*.
5. **Obvious structure.** A file's name and folder tell you what's inside.
6. **Short hand-off.** Tell the reviewer what changed and where to look.

Each is detailed below.

---

## 1. Small changes

A diff a human actually reads is roughly **under 200–300 changed lines**.
Above that, review quality collapses.

- Do **one concern per change**: a feature, a fix, or a refactor — never mixed.
- If a task needs more than ~300 lines, **don't write it all at once**. Propose
  a short plan of steps first (3–6 lines, one line per step), get a yes, then
  do step 1 and stop.
- Each step must leave the project working (builds, tests pass).
- Refactors needed for a feature go in their **own** step, before the feature.
- When running as an agent with git, commit after each step with a clear
  one-line message, so each step is reviewable on its own.

Plan format:

```
Plan (4 steps, ~250 lines total):
1. Extract formatPrice() into utils/money.ts (refactor, ~40 lines)
2. Add VAT check endpoint in billing/vat/ (~80 lines)
3. Call it from checkout page (~60 lines)
4. Tests for the endpoint (~70 lines)
Start with step 1?
```

If the user explicitly asks for everything at once, do it — but still keep
the internal structure clean and say how large the diff is.

## 2. Search before you write

Before writing **any** function, type, component, or helper:

1. Search the codebase for it (grep for the verb and the noun: `format`,
   `price`, `parseDate`, `validate`, `slug`…). Check `utils/`, `lib/`,
   `shared/`, `helpers/`, `common/` and neighbouring files.
2. Check the project's dependencies and the standard library. Don't hand-write
   what `Intl.NumberFormat`, `strings.Title`, `LINQ`, or an installed package
   already does.
3. If something close exists: **use it, or extend it** with a parameter.
   Don't write a near-copy.
4. If you're about to write the same logic a **second** time, extract it into
   one shared helper and make both places call it.

Where to put shared helpers: the project's existing shared folder if it has
one; otherwise create one small, topic-named file (`utils/money.ts`,
`internal/format/number.go`) — never a giant `utils.ts` / `helpers.go`
dumping ground.

Shared helpers take arguments for the things that vary instead of being
copied with tweaks:

```ts
// bad: three copies across files
const fmtEur = (n) => n.toFixed(2) + " €";
const fmtUsd = (n) => "$" + n.toFixed(2);

// good: one helper, one place
export function formatMoney(amount: number, currency = "EUR", locale = "fr-BE") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
```

Don't add a new dependency without saying so and why.

## 3. Touch only what the task needs

Every changed line costs the reviewer attention. So:

- Don't rewrite a working function to "improve" it unless asked.
- Don't rename, reformat, reorder imports, or move code that isn't part of
  the task. (Formatting is the formatter's job, in its own commit.)
- Don't rewrite a whole file to change ten lines — edit those ten lines.
- Don't add speculative features, config options, interfaces, or abstraction
  layers "for later". Build what's needed now; the simplest version that works.
- Don't add defensive checks for situations that can't happen.
- If you notice an unrelated problem, **mention it** at the end — don't fix it
  silently.

## 4. Comments: short, or none

Good names make most comments unnecessary. Write a comment only when the code
can't say it: a non-obvious **why**, a gotcha, a business rule, a workaround.

- Default length: **one short line**, often 3–8 words.
- Never narrate what the code does (`// loop over users`, `// return result`).
- No essays, no paragraphs explaining design philosophy, no "Note that…",
  no repeating the function name in prose.
- Doc comments on public/exported functions: one line, only if the name
  isn't already enough.
- No changelog comments (`// added for ticket 42`, `// new: …`) — that's
  what git is for.
- Delete commented-out code instead of leaving it.

Example — this is too much:

```go
// VATHandler serves the storefront's advisory VAT check.
//
// Advisory is the operative word. This endpoint exists so a business customer
// sees "no VAT will be charged" while they are still on the checkout page
// rather than discovering it on Stripe — but it decides nothing.
// OrderService.Create is given a verdict the *server* obtained at order time,
// and that is the only check that sets a price.
```

This is enough:

```go
// Advisory only; the order re-checks VAT server-side.
```

More examples per language: `references/comments.md`.

## 5. Obvious structure

A human should know in a glance **what a file does and where to find
something**.

**Files**
- One responsibility per file. The filename says it: `vat_check.go`,
  `useCart.ts`, `InvoicePdf.vue` — not `handler2.go`, `misc.ts`, `stuff.cs`.
- Aim for **under ~300 lines** per file. Past that, split by responsibility.
- Functions aim for **under ~40 lines** and one job. Long function → extract
  named steps.
- Public things at the top, private helpers below.

**Folders**
- Group by **feature/domain**, not by technical type, once a folder grows.
  `billing/vat/handler.go` beats `handlers/vat_handler.go` sitting among 40
  other handlers.
- Aim for **at most ~10–15 files per folder**. More than that → split into
  sub-folders by feature.
- Follow the project's existing conventions first. Only introduce a new
  structure when the current one breaks down, and propose it as its own step.
- Don't create a new file or folder when an existing one is the natural home.

Layout patterns by stack (Go, Vue/React/TS, C#/.NET, Python): see
`references/structure.md`.

**Names**
- Full, plain words: `calculateShippingCost`, not `calcShCst` or `doIt`.
- Same concept, same name everywhere (don't mix `client`/`customer`/`user`
  for one thing).
- Booleans read as questions: `isPaid`, `hasVat`.

## 6. Short hand-off

After every change, give the reviewer a summary they can read in ~10 seconds:

```
Changed (3 files, +84 / -12):
- billing/vat/check.go — new: VIES lookup with 5s timeout
- billing/vat/handler.go — new: GET /vat/check endpoint
- web/checkout/VatNotice.vue — shows "no VAT" when valid

Reused: formatMoney() from utils/money.ts
Look closely at: timeout handling in check.go (line 30–45)
Test: go test ./billing/vat/...
Not done / noticed: order service still has its own VAT copy — fix next?
```

Rules for the hand-off:
- List every touched file with a few words on why.
- Say what you **reused** — it shows you looked.
- Point to the one or two spots that deserve real attention.
- Say how to verify it.
- No long prose recap of the code itself.

---

## Before you finish: self-check

Run through this before presenting any change. Fix what fails.

- [ ] Is the diff small and about one concern? If >300 lines, did I split it?
- [ ] Did I search for existing code before writing new functions?
- [ ] Is any logic now duplicated? → extract a shared helper.
- [ ] Did I change lines unrelated to the task? → revert them.
- [ ] Any comment longer than one line, or explaining *what*? → shorten/delete.
- [ ] Does every new file have a clear single purpose and a telling name?
- [ ] Any file >300 lines, function >40 lines, folder >15 files? → split.
- [ ] Any new dependency, abstraction, or config nobody asked for? → remove.
- [ ] Is the hand-off summary there and short?

For reviewing an existing PR/MR (yours or someone else's) with these rules,
use `references/review-checklist.md`.

## Cleaning up existing code

To bring an existing codebase in line with these rules, use the commands in
`commands/` (see `COMMANDS.md` for when to run each):
`/deslop-audit`, `/deslop-next`, `/deslop-review`, `/deslop-dupes`, `/deslop-comments`,
`/deslop-split`, `/deslop-structure`, `/deslop-deadcode`, `/deslop-simplify`.

If the user asks for one of these cleanups in plain words ("remove useless
comments", "find duplicate functions", "audit my repo") read the matching
command file and follow it. `npx github:cdrcthv/deslop report [path]` lists oversized
files and crowded folders (any OS, needs Node).
