#!/usr/bin/env node
// PostToolUse: after Claude edits a .ts/.tsx file under src/ or tests/, run the
// unit tests (about 3 s). On failure, the failing part of the output is fed
// back to Claude so it can fix it.
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const MAX_REPORT = 4000;

function failureExcerpt(output) {
  const lines = output.split('\n');
  let start = lines.findIndex((line) => /failing tests:/i.test(line));
  if (start === -1) start = lines.findIndex((line) => /^\s*not ok\b/.test(line));
  const excerpt = (start === -1 ? lines.slice(-60) : lines.slice(start)).join('\n').trim();
  return excerpt.length > MAX_REPORT ? `${excerpt.slice(0, MAX_REPORT)}\n…(truncated)` : excerpt;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return;
  }
  const file = input.tool_input?.file_path || input.tool_response?.filePath;
  if (typeof file !== 'string') return;

  const rel = path.relative(projectDir, path.resolve(projectDir, file)).split(path.sep).join('/');
  if (!/^(src|tests)\//.test(rel) || !/\.tsx?$/.test(rel)) return;

  const result = spawnSync('npm', ['test', '--silent'], {
    cwd: projectDir,
    encoding: 'utf8',
    timeout: 90_000,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  if (result.status === 0) return;

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const why = result.error ? `could not run: ${result.error.message}` : failureExcerpt(output);
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `npm test failed after editing ${rel}:\n${why}`,
    }),
  );
});
