import { homedir } from "node:os";
import { join } from "node:path";

const home = homedir();

export const targets = {
  claude: {
    skills: { global: join(home, ".claude/skills"), project: ".claude/skills" },
    commands: { global: join(home, ".claude/commands"), project: ".claude/commands" },
  },
  cursor: {
    skills: { global: join(home, ".cursor/skills"), project: ".cursor/skills" },
    commands: { global: join(home, ".cursor/commands"), project: ".cursor/commands" },
  },
  copilot: {
    skills: { global: join(home, ".copilot/skills"), project: ".github/skills" },
    commands: { project: ".github/prompts" },
    commandExt: ".prompt.md",
  },
};
