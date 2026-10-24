# Coding rules: deslop (human-reviewable code)

The human must be able to review every change in a minute or two.
Optimize for the reviewer, not just for working code.

## Small changes
- One concern per change (feature OR fix OR refactor, never mixed).
- Keep diffs under ~300 changed lines. Bigger task → propose a 3–6 step plan,
  get approval, do one step, stop.
- Every step leaves the project building and tests passing.
- Agents with git: one commit per step, one-line message.

## Search before writing
- Before writing any function/component/helper, search the codebase
  (utils/, lib/, shared/, helpers/, neighbouring files) and the stdlib/deps.
- Use or extend what exists (add a parameter). Never write a near-copy.
- Same logic needed twice → extract one shared, parameterized helper in a
  topic-named file (lib/money.ts, internal/format/number.go). No giant utils file.
- No new dependency without saying why.

## Touch only what's needed
- No unrelated rewrites, renames, reformatting, import reordering or moves.
- Edit the lines that need it; don't regenerate whole files.
- No speculative options, interfaces, or abstractions "for later".
- Noticed an unrelated issue? Mention it; don't fix silently.

## Comments
- Default: no comment. Good names first.
- If needed: one short line (3–8 words) about WHY, never WHAT.
- No essays, no changelog notes, no commented-out code, no section banners.
- Bad: a 6-line paragraph explaining an endpoint's philosophy.
  Good: `// Advisory only; the order re-checks VAT server-side.`

## Structure
- One responsibility per file; filename says what it does.
- Files < ~300 lines, functions < ~40 lines, folders < ~10–15 files.
- Group by feature/domain (billing/vat/handler.go), not one giant
  handlers/ folder with 40 files.
- Follow existing project conventions first.
- Plain full-word names; one name per concept; booleans as isX/hasX.

## Hand-off after every change
```
Changed (N files, +X / -Y):
- path/file — few words why
Reused: existing helpers used
Look closely at: 1–2 spots
Test: command to verify
Noticed: unrelated issues, not fixed
```

## Self-check before finishing
Small & one concern? Searched first? No duplication? No unrelated edits?
Comments one-line or gone? Files/folders well named and sized?
No unrequested deps/abstractions? Hand-off present?
