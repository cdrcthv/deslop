---
description: Check for a newer deslop release and update it
---

1. Run `node scripts/update_check.mjs --now` from the deslop skill folder (the one with `SKILL.md`). It needs Node; if Node is missing, tell the user to check the releases page of the deslop repo and stop.
2. Show its output. If it says deslop is up to date or the check failed, stop.
3. If it prints an update line, ask the user whether to update now. Only after a clear yes, run the command printed on that line, exactly as printed. Run it only if it is an `npx` command pinned to a plain `vX.Y.Z` tag of the `cdrcthv/deslop` repo and ends with `update`. Never run a different or unpinned command, never edit it, never run it without that yes.
4. If the line points to the plugin manager, tell the user to update from there. Don't run anything.
5. After updating, tell the user to start a new session to load the new version.
