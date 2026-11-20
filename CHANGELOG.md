# Changelog

## [Unreleased]

### Added
- `npx github:cdrcthv/deslop update` reinstalls deslop wherever it is already installed (every tool, user and project folders) and shows the version change
- `skills/deslop/VERSION`: the installed version travels with the skill, whatever the install route. Checked against `package.json` by `npm run validate` and the release workflow

- `/deslop-audit`, `/deslop-next` and `/deslop-review` show a one-line notice when a newer release exists (`scripts/update_check.mjs`). It only reads the release number from the GitHub API, at most once a day, is silent offline and in CI, and `DESLOP_NO_UPDATE_CHECK=1` turns it off. Only a strict `vX.Y.Z` is accepted
- `/deslop-update` checks on demand; the update command is pinned to the release tag and only run after the user agrees

### Changed
- `npm run validate` also rejects `npx` with flags (`npx -y github:...`) in commands

### Note
- 1.0.2 and older have no `VERSION` file: update them once by hand with the install command; later updates can use `update`

## [1.0.2] - 2026-11-05

### Fixed
- `/deslop-audit`, `/deslop-structure` and the skill no longer run `npx github:cdrcthv/deslop` (unpinned remote code); they use the installed `scripts/size_report.mjs`

### Added
- `npm test` and `npm run validate`: repo checks and installer tests
- CI on Ubuntu, macOS and Windows (Node 18 and 22)
- Issue templates for bugs and rule suggestions
- Release workflow: pushing a `v*` tag checks versions and changelog, builds `deslop.skill` and publishes the release

## [1.0.1] - 2026-10-25

### Added
- `npx github:cdrcthv/deslop report [path]` lists oversized files and crowded folders
- `--uninstall`
- Warning when the plugin is also installed (everything would load twice)

### Changed
- Reinstalling replaces the old deslop files
- Copilot prompt files use `${input:...}` instead of `$ARGUMENTS`

## [1.0.0] - 2026-10-24

First release: the skill, 9 `/deslop-*` commands, the installer for Claude Code,
Cursor and Copilot, and the Claude Code plugin.
