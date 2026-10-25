# Deslop

**Stop AI slop before it hits your PR.**

An agent skill that makes your AI write code you can actually review.

AI coding tools love to produce `+1000 / -1000` diffs, rewrite helpers that
already exist, write paragraph-long comments, and dump 40 files into one
`handlers/` folder. The result: you stop reading and just click *merge*.

This skill teaches your AI to work the way a good colleague would:

- **Small changes**: one concern at a time, under ~300 lines, with a short plan for anything bigger
- **Search before writing**: reuse existing code, extract shared helpers instead of copy-pasting
- **Touch only what's needed**: no drive-by rewrites or reformatting
- **Short comments, or none**: one line about *why*, never *what*
- **Clear structure**: folders by feature, short files, obvious names
- **10-second summary**: every change ends with what changed, where to look, and how to test

```diff
- // VATHandler serves the storefront's advisory VAT check.
- //
- // Advisory is the operative word. This endpoint exists so a business customer
- // sees "no VAT will be charged" while they are still on the checkout page
- // rather than discovering it on Stripe — but it decides nothing.
- // OrderService.Create is given a verdict the *server* obtained at order time,
- // and that is the only check that sets a price.
+ // Advisory only; the order re-checks VAT server-side.
```

## Install

```bash
npx github:cdrcthv/deslop
```

Installs the skill **and** the `/deslop-*` commands, for Claude Code by default.
Pick other tools with flags:

| Flag | Installs to |
|---|---|
| `--claude` | Claude Code |
| `--cursor` | Cursor |
| `--copilot` | GitHub Copilot |
| `--agents-md` | Appends the rules to `./AGENTS.md` (Codex, Gemini, Zed, …) |
| `--project` | Current repo instead of your user folder, so you can commit it for your team |

```bash
npx github:cdrcthv/deslop --claude --cursor --project
```

List oversized files and crowded folders without installing anything:

```bash
npx github:cdrcthv/deslop report [path]
```

### Other AI tools (skill only)

```bash
npx skills add cdrcthv/deslop
```

Uses the open [skills CLI](https://github.com/vercel-labs/skills), which supports
many more tools but installs the skill without the slash commands. You can
still run every cleanup by asking in plain words.

### Claude Code plugin

Inside Claude Code:

```
/plugin marketplace add cdrcthv/deslop
/plugin install deslop@cdrcthv
```

### Claude.ai and the Claude desktop app

Download `deslop.skill` from the
[latest release](https://github.com/cdrcthv/deslop/releases/latest)
and upload it in the Skills section of your settings.

### Manually

```bash
git clone https://github.com/cdrcthv/deslop
cp -r deslop/skills/deslop ~/.claude/skills/
cp deslop/skills/deslop/commands/deslop-*.md ~/.claude/commands/
```

For a tool without skill support, paste
[`portable/AGENTS.md`](skills/deslop/portable/AGENTS.md) into its
rules file (`AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`…).

## Commands

Commands for de-slopping an **existing** codebase. Every command that edits
lists what it found first, lets you choose, then fixes one small step at a time:
own git branch, tests before and after, one commit, then stop.

| Command | Does | Run it |
|---|---|---|
| `/deslop-audit` | Read-only scan, writes a prioritized plan to `.deslop/audit.md` | First time on a project |
| `/deslop-next` | Does the next item of that plan | Whenever you have 10 minutes |
| `/deslop-review` | Reviews your branch before merging | Before every PR/MR |
| `/deslop-deadcode` | Removes unused code and dependencies | After big features |
| `/deslop-dupes` | Merges duplicate functions into shared helpers | Monthly |
| `/deslop-comments` | Deletes noise comments, shortens long ones | After vibe-coding sessions |
| `/deslop-split` | Splits long files and functions | File over ~300 lines |
| `/deslop-structure` | Reorganizes folders by feature | Folder over ~15 files |
| `/deslop-simplify` | Removes needless abstractions | Quarterly |

All commands accept a path: `/deslop-dupes src/features/cart`.
No slash commands in your tool? Just ask: *"find duplicate functions in src/"*.

More detail: [`COMMANDS.md`](skills/deslop/COMMANDS.md).

## What's inside

```
skills/deslop/
├── SKILL.md            the rules
├── COMMANDS.md         when to run which command
├── commands/           the /deslop-* commands
├── references/         comment examples, folder layouts per stack, review checklist
├── scripts/            size_report.mjs: finds long files and crowded folders (any OS)
└── portable/AGENTS.md  rules for tools without skill support
```

## Contributing

Issues and PRs welcome. Keep them small and reviewable, obviously. 😉

## License

[MIT](LICENSE)
