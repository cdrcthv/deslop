# Changelog

## [Unreleased]

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
