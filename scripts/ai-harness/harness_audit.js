#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const checks = [
  ['CLAUDE.md', 'CLAUDE.md'],
  ['Claude settings', '.claude/settings.json'],
  ['Implementation policy rule', '.claude/rules/00-implementation-policy.md'],
  ['Design skill', '.claude/skills/harness-design/SKILL.md'],
  ['Review skill', '.claude/skills/harness-review/SKILL.md'],
  ['Implement skill', '.claude/skills/harness-implement/SKILL.md'],
  ['UI design skill', '.claude/skills/ui-design/SKILL.md'],
  ['Bug fix skill', '.claude/skills/bug-fix/SKILL.md'],
  ['Codex dispatch skill', '.claude/skills/codex-dispatch/SKILL.md'],
  ['Harness workflow skill', '.claude/skills/harness-workflow/SKILL.md'],
  ['Harness help skill', '.claude/skills/harness-help/SKILL.md'],
  ['Agent team builder skill', '.claude/skills/agent-team-builder/SKILL.md'],
  ['Rules distill skill', '.claude/skills/rules-distill/SKILL.md'],
  ['Task planner agent', '.claude/agents/task-planner-reviewer.md'],
  ['Task review agent', '.claude/agents/task-review-agent.md'],
  ['Integration review agent', '.claude/agents/integration-review-agent.md'],
  ['Quality gates doc', 'docs/harness/quality-gates.md'],
  ['Document storage policy', 'docs/harness/document-storage.md'],
  ['Design document directory', 'docs/sekkeisyo/README.md'],
  ['UI document directory', 'docs/ui/README.md'],
  ['Bug document directory', 'docs/bugs/README.md'],
  ['Task document directory', 'docs/tasks/README.md'],
  ['Worktree parallel doc', 'docs/harness/worktree-parallel.md'],
  ['Codex task workers doc', 'docs/harness/codex-task-workers.md'],
  ['Obsidian output policy', 'docs/harness/obsidian-output.md'],
  ['MCP servers doc', 'docs/harness/mcp-servers.md'],
  ['MCP example config', 'mcp-configs/obsidian-mdn.mcp.example.json'],
  ['Agents doc', 'docs/harness/agents.md'],
  ['Codex tool spec', 'docs/harness/tools/codex-cli-tool.md'],
  ['Codex wrapper', 'scripts/ai-harness/codex_cli.sh'],
  ['Codex review prompt', 'scripts/ai-harness/prompts/review.md'],
  ['Codex prototype patch prompt', 'scripts/ai-harness/prompts/prototype_patch.md'],
  ['Codex task worker prompt', 'scripts/ai-harness/prompts/task_worker_goal.md'],
  ['Codex bug analysis prompt', 'scripts/ai-harness/prompts/bug_analysis.md'],
  ['Codex bug fix prompt', 'scripts/ai-harness/prompts/bug_fix_goal.md'],
  ['Codex integration worker prompt', 'scripts/ai-harness/prompts/integration_worker_goal.md'],
  ['Knowledge README', 'docs/knowledge/README.md'],
];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function checkSettings() {
  const file = '.claude/settings.json';
  if (!exists(file)) {
    return ['Git guardrails', false, 'settings.json not found'];
  }

  const text = read(file);
  const required = ['git add', 'git commit', 'git push'];
  const missing = required.filter((item) => !text.includes(item));

  if (missing.length > 0) {
    return ['Git guardrails', false, `missing deny patterns: ${missing.join(', ')}`];
  }

  return ['Git guardrails', true, 'git add/commit/push are denied'];
}

function checkCompletionProtocol() {
  const required = [
    ['scripts/ai-harness/codex_cli.sh', 'finished-unconfirmed'],
    ['scripts/ai-harness/prompts/task_worker_goal.md', 'CODEX_RESULT: COMPLETE'],
    ['scripts/ai-harness/prompts/bug_fix_goal.md', 'CODEX_RESULT: COMPLETE'],
    ['scripts/ai-harness/prompts/integration_worker_goal.md', 'CODEX_RESULT: COMPLETE'],
    ['.claude/skills/codex-dispatch/SKILL.md', 'run_in_background: true'],
    ['.claude/skills/agent-team-builder/SKILL.md', 'Background Completion Protocol'],
    ['.claude/skills/bug-fix/SKILL.md', 'Background Completion Protocol'],
    ['.claude/skills/harness-implement/SKILL.md', 'Background Completion Protocol'],
    ['.claude/skills/harness-review/SKILL.md', 'Background Completion Protocol'],
    ['.claude/skills/harness-workflow/SKILL.md', 'Background Completion Protocol'],
    ['.claude/agents/task-planner-reviewer.md', 'Background Completion Protocol'],
    ['.claude/agents/task-review-agent.md', 'Background Completion Protocol'],
    ['.claude/agents/integration-review-agent.md', 'Background Completion Protocol'],
  ];

  const missing = required.filter(([file, marker]) => !exists(file) || !read(file).includes(marker));
  if (missing.length > 0) {
    return ['Codex completion protocol', false, `missing markers: ${missing.map(([file]) => file).join(', ')}`];
  }

  const skillDir = path.join(root, '.claude/skills');
  const directCalls = fs.readdirSync(skillDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `.claude/skills/${entry.name}/SKILL.md`)
    .filter((file) => exists(file) && /(^|\s)codex exec(\s|$)/m.test(read(file)));

  if (directCalls.length > 0) {
    return ['Codex completion protocol', false, `direct codex exec found: ${directCalls.join(', ')}`];
  }

  return ['Codex completion protocol', true, 'all Codex execution skills use background notification; worker markers are configured'];
}

const results = checks.map(([name, file]) => [name, exists(file), file]);
results.push(checkSettings());
results.push(checkCompletionProtocol());

const passed = results.filter(([, ok]) => ok).length;
const total = results.length;

console.log(`# Harness Audit`);
console.log();
console.log(`Root: ${root}`);
console.log(`Score: ${passed}/${total}`);
console.log();

for (const [name, ok, detail] of results) {
  const mark = ok ? 'OK' : 'MISSING';
  console.log(`- ${mark}: ${name} (${detail})`);
}

if (passed !== total) {
  process.exitCode = 1;
}
