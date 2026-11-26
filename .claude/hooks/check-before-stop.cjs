#!/usr/bin/env node
// Stop: before Claude ends its turn, run `tsc --noEmit` and the unit tests,
// but only when the uncommitted .ts/.tsx changes differ from the last state
// that passed. This also catches edits made through Bash, which the
// PostToolUse test hook does not see.
// On failure Claude is asked to keep going and fix it; if it already did once
// (stop_hook_active), the errors are shown to the user instead, to avoid a loop.
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateDir = path.join(os.tmpdir(), 'claude-project-hooks');
const stateFile = path.join(
  stateDir,
  `${crypto.createHash('sha1').update(projectDir).digest('hex').slice(0, 12)}.last-green`,
);
const MAX_REPORT = 4000;

const git = (...args) => spawnSync('git', args, { cwd: projectDir, encoding: 'utf8' }).stdout || '';
const readOr = (file, fallback) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return fallback;
  }
};

function currentChangesHash() {
  const diff = git('diff', 'HEAD', '--', '*.ts', '*.tsx');
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', '*.ts', '*.tsx')
    .split('\n')
    .filter(Boolean);
  if (!diff && untracked.length === 0) return null;
  const hash = crypto.createHash('sha256').update(diff);
  for (const file of untracked) hash.update(`\0${file}\0${readOr(path.join(projectDir, file), '')}`);
  return hash.digest('hex');
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: projectDir,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('error', (err) => resolve({ ok: false, out: `could not run ${cmd}: ${err.message}` }));
    child.on('close', (code) => resolve({ ok: code === 0, out }));
  });
}

function excerpt(text, pick) {
  const lines = text.split('\n');
  const chosen = pick(lines).join('\n').trim();
  return chosen.length > MAX_REPORT ? `${chosen.slice(0, MAX_REPORT)}\n…(truncated)` : chosen;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', async () => {
  let input = {};
  try {
    input = JSON.parse(raw || '{}');
  } catch {}

  const hash = currentChangesHash();
  if (!hash || readOr(stateFile, '') === hash) return;

  const tscBin = path.join(projectDir, 'node_modules', '.bin', 'tsc');
  const [tsc, tests] = await Promise.all([
    run(tscBin, ['--noEmit', '--pretty', 'false']),
    run('npm', ['test', '--silent']),
  ]);

  if (tsc.ok && tests.ok) {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(stateFile, hash);
    return;
  }

  const parts = [];
  if (!tsc.ok) {
    parts.push(
      `tsc --noEmit failed:\n${excerpt(tsc.out, (lines) => {
        const errors = lines.filter((l) => /error TS\d+/.test(l));
        return errors.length ? errors.slice(0, 30) : lines.slice(-30);
      })}`,
    );
  }
  if (!tests.ok) {
    parts.push(
      `npm test failed:\n${excerpt(tests.out, (lines) => {
        let start = lines.findIndex((l) => /failing tests:/i.test(l));
        if (start === -1) start = lines.findIndex((l) => /^\s*not ok\b/.test(l));
        return start === -1 ? lines.slice(-60) : lines.slice(start);
      })}`,
    );
  }
  const report = parts.join('\n\n');

  if (input.stop_hook_active) {
    process.stdout.write(JSON.stringify({ systemMessage: `Type-check/tests still failing:\n${report}` }));
  } else {
    process.stdout.write(
      JSON.stringify({ decision: 'block', reason: `Before finishing, fix these errors:\n${report}` }),
    );
  }
});
