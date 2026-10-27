// Where each coding agent loads skills: personal (global) folder, project folder, and how to tell it is installed.
// Single source of truth for install.mjs and preflight.mjs — when an agent moves its skills folder, edit this table.
// Sources (checked 2026-10): Codex docs (learn.chatgpt.com/docs/build-skills: $HOME/.agents/skills), Antigravity
// codelab (~/.gemini/antigravity/skills), vercel-labs/skills docs/agents.md (other agents).
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();
const claudeHome = process.env.CLAUDE_CONFIG_DIR ?? join(home, '.claude');
const codexHome = process.env.CODEX_HOME ?? join(home, '.codex');

export const AGENTS = {
  claude: { label: 'Claude Code', global: join(claudeHome, 'skills'), project: '.claude/skills', detect: [claudeHome] },
  codex: { label: 'Codex (CLI, IDE, app)', global: join(home, '.agents', 'skills'), project: '.agents/skills', detect: [codexHome] },
  antigravity: {
    label: 'Google Antigravity',
    global: join(home, '.gemini', 'antigravity', 'skills'),
    project: '.agents/skills',
    detect: [join(home, '.gemini', 'antigravity'), join(home, '.antigravity'), join(home, '.antigravity-ide')],
  },
  gemini: { label: 'Gemini CLI', global: join(home, '.gemini', 'skills'), project: '.agents/skills', detect: [join(home, '.gemini', 'settings.json')] },
  cursor: { label: 'Cursor', global: join(home, '.cursor', 'skills'), project: '.agents/skills', detect: [join(home, '.cursor')] },
  copilot: { label: 'GitHub Copilot', global: join(home, '.copilot', 'skills'), project: '.agents/skills', detect: [join(home, '.copilot')] },
  opencode: { label: 'OpenCode', global: join(home, '.config', 'opencode', 'skills'), project: '.agents/skills', detect: [join(home, '.config', 'opencode')] },
  workbuddy: { label: 'WorkBuddy / CodeBuddy', global: join(home, '.codebuddy', 'skills'), project: '.codebuddy/skills', detect: [join(home, '.codebuddy')] },
  trae: { label: 'Trae', global: join(home, '.trae', 'skills'), project: '.trae/skills', detect: [join(home, '.trae')] },
  windsurf: { label: 'Windsurf', global: join(home, '.codeium', 'windsurf', 'skills'), project: '.windsurf/skills', detect: [join(home, '.codeium', 'windsurf')] },
  kiro: { label: 'Kiro CLI', global: join(home, '.kiro', 'skills'), project: '.kiro/skills', detect: [join(home, '.kiro')] },
  qwen: { label: 'Qwen Code', global: join(home, '.qwen', 'skills'), project: '.qwen/skills', detect: [join(home, '.qwen')] },
};

// Other names people (and the official base-database-cli / vercel skills CLI) use for the same targets.
export const ALIASES = {
  agents: 'codex',
  'claude-code': 'claude',
  codebuddy: 'workbuddy',
  'gemini-cli': 'gemini',
  'github-copilot': 'copilot',
  'kiro-cli': 'kiro',
  'qwen-code': 'qwen',
};

// Folders that are no longer an agent's documented location but still hold skills on many machines
// (the official base-database-cli writes its Codex copy to ~/.codex/skills).
export const LEGACY_ROOTS = { 'codex (~/.codex/skills)': join(codexHome, 'skills') };

export const resolveAgent = (name) => (AGENTS[name] ? name : ALIASES[name] ?? null);
export const detectAgents = () => Object.keys(AGENTS).filter((key) => AGENTS[key].detect.some((p) => existsSync(p)));
