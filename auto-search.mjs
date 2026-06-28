#!/usr/bin/env node
/**
 * auto-search.mjs — Full job search cycle: scan → evaluate → merge → verify
 *
 * Usage:
 *   node auto-search.mjs              # full cycle
 *   node auto-search.mjs --dry-run    # preview without executing
 *   node auto-search.mjs --scan-only  # scan portals, skip evaluation
 *   node auto-search.mjs --eval-only  # evaluate pending, skip scan
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const SCAN_ONLY = ARGS.includes('--scan-only');
const EVAL_ONLY = ARGS.includes('--eval-only');

const CAREER_OPS = dirname(fileURLToPath(import.meta.url));

// ── Profile resolution ──────────────────────────────────────────────
const args = process.argv.slice(2);
const profileFlag = args.indexOf('--profile');
let profile = profileFlag !== -1 ? args[profileFlag + 1] : process.env.CAREER_OPS_PROFILE;

if (!profile) {
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  profile = await new Promise(resolve => {
    rl.question('¿Qué perfil? (recepcionista / formacion): ', ans => { rl.close(); resolve(ans.trim()); });
  });
}

if (!profile) {
  console.error('Error: perfil no especificado. Usa --profile <nombre> o CAREER_OPS_PROFILE.');
  process.exit(1);
}

const profileDir = join(CAREER_OPS, 'profiles', profile);
if (!existsSync(profileDir)) {
  const available = existsSync(join(CAREER_OPS, 'profiles'))
    ? readdirSync(join(CAREER_OPS, 'profiles')).filter(d => !d.startsWith('.')).join(', ')
    : '(ninguno)';
  console.error(`Error: perfil "${profile}" no existe en profiles/. Disponibles: ${available}`);
  process.exit(1);
}

console.log(`[Perfil activo: ${profile}]`);

const DATE = new Date().toISOString().slice(0, 10);
const PIPELINE_PATH = join(profileDir, 'data/pipeline.md');
const APPLICATIONS_PATH = join(profileDir, 'data/applications.md');
const BATCH_PROMPT_PATH = 'batch/batch-prompt.md';
const REPORTS_DIR = 'reports';

// ── Helpers ──────────────────────────────────────────────────────────

function hr(char = '─', width = 50) {
  return char.repeat(width);
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 30);
}

function parsePendingOffers() {
  if (!existsSync(PIPELINE_PATH)) return [];
  const text = readFileSync(PIPELINE_PATH, 'utf-8');
  const pending = [];

  for (const line of text.split('\n')) {
    if (!/^- \[ \]/.test(line)) continue;

    const urlMatch = line.match(/https?:\/\/[^\s|]+/);
    if (!urlMatch) continue;
    const url = urlMatch[0].replace(/[.,;|]+$/, '').trim();

    // Fields after the URL, pipe-separated
    const rest = line.slice(line.indexOf(url) + url.length);
    const fields = rest.split('|').map(s => s.trim()).filter(Boolean);
    const company = fields[0] || (() => { try { return new URL(url).hostname; } catch { return 'Unknown'; } })();
    const title = fields[1] || 'Unknown Role';

    pending.push({ url, company, title });
  }

  return pending;
}

function getNextReportNum() {
  let maxNum = 0;

  if (existsSync(REPORTS_DIR)) {
    for (const f of readdirSync(REPORTS_DIR)) {
      const m = f.match(/^(\d+)-/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
  }

  if (existsSync(APPLICATIONS_PATH)) {
    const text = readFileSync(APPLICATIONS_PATH, 'utf-8');
    for (const m of text.matchAll(/^\|\s*(\d+)\s*\|/gm)) {
      maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
  }

  return maxNum + 1;
}

function buildBatchPrompt(offer, reportNum, id) {
  if (!existsSync(BATCH_PROMPT_PATH)) {
    throw new Error(`batch-prompt.md not found at ${BATCH_PROMPT_PATH}`);
  }
  const template = readFileSync(BATCH_PROMPT_PATH, 'utf-8');
  const numPadded = String(reportNum).padStart(3, '0');
  return template
    .replace(/\{\{URL\}\}/g, offer.url)
    .replace(/\{\{JD_FILE\}\}/g, `jds/auto-${id}.md`)
    .replace(/\{\{REPORT_NUM\}\}/g, numPadded)
    .replace(/\{\{DATE\}\}/g, DATE)
    .replace(/\{\{ID\}\}/g, id);
}

function markProcessed(url) {
  const text = readFileSync(PIPELINE_PATH, 'utf-8');
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const updated = text.replace(
    new RegExp(`^(- )\\[ \\]( [^\\n]*${escaped}[^\\n]*)`, 'm'),
    '$1[x]$2',
  );
  if (updated !== text) writeFileSync(PIPELINE_PATH, updated, 'utf-8');
}

// ── Subprocess runner ────────────────────────────────────────────────

async function runNode(script, scriptArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...scriptArgs], {
      stdio: 'inherit',
      windowsHide: true,
    });
    child.on('close', code => resolve(code ?? 0));
    child.on('error', reject);
  });
}

async function runClaudeEval(offer, reportNum) {
  const id = `${String(reportNum).padStart(3, '0')}-${slugify(offer.company)}`;
  const prompt = buildBatchPrompt(offer, reportNum, id);

  return new Promise((resolve, reject) => {
    // Pipe prompt via stdin — avoids OS command-line length limits
    const child = spawn('claude', ['--print', '--dangerously-skip-permissions'], {
      stdio: ['pipe', 'inherit', 'inherit'],
      windowsHide: true,
    });

    child.stdin.on('error', () => {});
    child.stdin.write(prompt, 'utf-8');
    child.stdin.end();

    child.on('close', code => resolve({ code: code ?? 0, id }));
    child.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error('claude CLI not found. Is Claude Code installed and in PATH?'));
      } else {
        reject(err);
      }
    });
  });
}

// ── Phases ───────────────────────────────────────────────────────────

async function phaseScan() {
  console.log('\n' + hr('═'));
  console.log('Phase 1 — Scan portals');
  console.log(hr('═'));

  if (DRY_RUN) {
    console.log('[dry-run] Would run: node scan.mjs');
    return 0;
  }

  return runNode('scan.mjs', ['--profile', profile]);
}

async function phaseEvaluate(pending) {
  console.log('\n' + hr('═'));
  console.log(`Phase 2 — Evaluate ${pending.length} pending offer(s)`);
  console.log(hr('═'));

  if (pending.length === 0) {
    if (!DRY_RUN) console.log('No pending offers — nothing to evaluate.');
    return { evaluated: 0, failed: 0 };
  }

  let nextReportNum = getNextReportNum();
  let evaluated = 0;
  let failed = 0;
  const results = [];

  for (let i = 0; i < pending.length; i++) {
    const offer = pending[i];
    const numPadded = String(nextReportNum).padStart(3, '0');
    console.log(`\n[${i + 1}/${pending.length}] ${offer.company} | ${offer.title}`);
    console.log(`  URL: ${offer.url}`);
    console.log(`  Report #${numPadded}`);

    if (DRY_RUN) {
      console.log(`  [dry-run] Would invoke: claude --print --dangerously-skip-permissions`);
      console.log(`            Prompt: batch-prompt.md interpolated with URL + REPORT_NUM=${numPadded}`);
      results.push({ offer, reportNum: nextReportNum, dryRun: true });
      nextReportNum++;
      continue;
    }

    try {
      const { code, id } = await runClaudeEval(offer, nextReportNum);
      if (code === 0) {
        console.log(`  ✓ Done — ${id}`);
        markProcessed(offer.url);
        evaluated++;
        results.push({ offer, id, reportNum: nextReportNum, success: true });
      } else {
        console.error(`  ✗ Failed — exit code ${code}`);
        failed++;
        results.push({ offer, reportNum: nextReportNum, success: false, error: `exit ${code}` });
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      failed++;
      results.push({ offer, reportNum: nextReportNum, success: false, error: err.message });
    }

    nextReportNum++;
  }

  return { evaluated, failed, results };
}

async function phaseMerge() {
  console.log('\n' + hr('─'));
  console.log('Phase 3 — Merge tracker additions');
  console.log(hr('─'));
  if (DRY_RUN) { console.log('[dry-run] Would run: node merge-tracker.mjs'); return 0; }
  return runNode('merge-tracker.mjs');
}

async function phaseVerify() {
  console.log('\n' + hr('─'));
  console.log('Phase 4 — Verify pipeline integrity');
  console.log(hr('─'));
  if (DRY_RUN) { console.log('[dry-run] Would run: node verify-pipeline.mjs'); return 0; }
  return runNode('verify-pipeline.mjs');
}

// ── Summary ──────────────────────────────────────────────────────────

function printSummary({ scanned, evalStats }) {
  console.log('\n' + hr('═'));
  console.log(`Auto-Search Summary — ${DATE}`);
  console.log(hr('═'));
  if (!EVAL_ONLY) console.log(`Scan:       ${DRY_RUN ? '[dry-run]' : scanned === 0 ? 'completed (exit 0)' : `completed (exit ${scanned})`}`);
  if (!SCAN_ONLY && evalStats) {
    if (DRY_RUN) {
      console.log(`Evaluate:   ${evalStats.evaluated || 0} would be evaluated [dry-run]`);
    } else {
      console.log(`Evaluated:  ${evalStats.evaluated ?? 0} succeeded`);
      if (evalStats.failed) console.log(`Failed:     ${evalStats.failed}`);
    }
  }
  if (DRY_RUN) {
    console.log('\n→ Remove --dry-run to execute the full cycle.');
  } else {
    console.log('\n→ Run /career-ops tracker to see the updated pipeline.');
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(hr('═'));
  console.log(`career-ops auto-search — ${DATE}${DRY_RUN ? ' [DRY-RUN]' : ''}`);
  console.log(hr('═'));

  if (SCAN_ONLY && EVAL_ONLY) {
    console.error('Error: --scan-only and --eval-only are mutually exclusive.');
    process.exit(1);
  }

  let scanExit = 0;
  let evalStats = null;

  // Phase 1: Scan
  if (!EVAL_ONLY) {
    scanExit = await phaseScan();
    if (scanExit !== 0 && !DRY_RUN) {
      console.error(`\nScan exited with code ${scanExit} — continuing with any pending offers in pipeline.`);
    }
  }

  // Phase 2: Evaluate
  if (!SCAN_ONLY) {
    const pending = parsePendingOffers();

    if (pending.length === 0 && !DRY_RUN) {
      console.log('\nNo pending offers in pipeline.md — nothing to evaluate.');
    } else {
      evalStats = await phaseEvaluate(pending);
    }

    // Phase 3: Merge (only if evaluations ran)
    if (evalStats && (evalStats.evaluated > 0 || DRY_RUN)) {
      await phaseMerge();
      await phaseVerify();
    }
  }

  printSummary({ scanned: scanExit, evalStats });
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
