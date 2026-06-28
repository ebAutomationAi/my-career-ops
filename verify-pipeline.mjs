#!/usr/bin/env node
/**
 * verify-pipeline.mjs — Health check for career-ops pipeline integrity
 *
 * Checks:
 * 1. All statuses are canonical (per states.yml)
 * 2. No duplicate company+role entries
 * 3. All report links point to existing files
 * 4. Scores match format X.XX/5 or N/A or DUP
 * 5. All rows have proper pipe-delimited format
 * 6. No pending TSVs in tracker-additions/ (only in merged/ or archived/)
 * 7. states.yml canonical IDs for cross-system consistency
 *
 * Run: node career-ops/verify-pipeline.mjs
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

const APPS_FILE = join(profileDir, 'data/applications.md');
const TSV_FILE = APPS_FILE.replace(/\.md$/, '.tsv');
const ADDITIONS_DIR = join(CAREER_OPS, 'batch/tracker-additions');
const REPORTS_DIR = join(CAREER_OPS, 'reports');
const STATES_FILE = existsSync(join(CAREER_OPS, 'templates/states.yml'))
  ? join(CAREER_OPS, 'templates/states.yml')
  : join(CAREER_OPS, 'states.yml');

// Ensure required directories exist
mkdirSync(join(profileDir, 'data'), { recursive: true });
mkdirSync(REPORTS_DIR, { recursive: true });

const CANONICAL_STATUSES = [
  'evaluated', 'applied', 'responded', 'interview',
  'offer', 'rejected', 'discarded', 'skip',
];

const ALIASES = {
  'evaluada': 'evaluated', 'condicional': 'evaluated', 'hold': 'evaluated', 'evaluar': 'evaluated', 'verificar': 'evaluated',
  'aplicado': 'applied', 'enviada': 'applied', 'aplicada': 'applied', 'applied': 'applied', 'sent': 'applied',
  'respondido': 'responded',
  'entrevista': 'interview',
  'oferta': 'offer',
  'rechazado': 'rejected', 'rechazada': 'rejected',
  'descartado': 'discarded', 'descartada': 'discarded', 'cerrada': 'discarded', 'cancelada': 'discarded',
  'no aplicar': 'skip', 'no_aplicar': 'skip', 'monitor': 'skip', 'geo blocker': 'skip',
};

let errors = 0;
let warnings = 0;

function error(msg) { console.log(`❌ ${msg}`); errors++; }
function warn(msg) { console.log(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`✅ ${msg}`); }

// --- Read applications.md ---
if (!existsSync(APPS_FILE)) {
  console.log('\n📊 No applications.md found. This is normal for a fresh setup.');
  console.log('   The file will be created when you evaluate your first offer.\n');
  process.exit(0);
}
const content = readFileSync(APPS_FILE, 'utf-8');
const lines = content.split('\n');

const entries = [];
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  const parts = line.split('|').map(s => s.trim());
  if (parts.length < 9) continue;
  const num = parseInt(parts[1]);
  if (isNaN(num)) continue;
  entries.push({
    num, date: parts[2], company: parts[3], role: parts[4],
    score: parts[5], status: parts[6], pdf: parts[7], report: parts[8],
    notes: parts[9] || '',
    channel: parts[10] || '',
    source: parts[11] || '',
    colCount: parts.length - 2,
  });
}

console.log(`\n📊 Checking ${entries.length} entries in applications.md\n`);

// --- Check 1: Canonical statuses ---
let badStatuses = 0;
for (const e of entries) {
  const clean = e.status.replace(/\*\*/g, '').trim().toLowerCase();
  // Strip trailing dates
  const statusOnly = clean.replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();

  if (!CANONICAL_STATUSES.includes(statusOnly) && !ALIASES[statusOnly]) {
    error(`#${e.num}: Non-canonical status "${e.status}"`);
    badStatuses++;
  }

  // Check for markdown bold in status
  if (e.status.includes('**')) {
    error(`#${e.num}: Status contains markdown bold: "${e.status}"`);
    badStatuses++;
  }

  // Check for dates in status
  if (/\d{4}-\d{2}-\d{2}/.test(e.status)) {
    error(`#${e.num}: Status contains date: "${e.status}" — dates go in date column`);
    badStatuses++;
  }
}
if (badStatuses === 0) ok('All statuses are canonical');

// --- Check 2: Duplicates ---
const companyRoleMap = new Map();
let dupes = 0;
for (const e of entries) {
  const key = e.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '::' +
    e.role.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (!companyRoleMap.has(key)) companyRoleMap.set(key, []);
  companyRoleMap.get(key).push(e);
}
for (const [key, group] of companyRoleMap) {
  if (group.length > 1) {
    warn(`Possible duplicates: ${group.map(e => `#${e.num}`).join(', ')} (${group[0].company} — ${group[0].role})`);
    dupes++;
  }
}
if (dupes === 0) ok('No exact duplicates found');

// --- Check 3: Report links ---
let brokenReports = 0;
for (const e of entries) {
  const match = e.report.match(/\]\(([^)]+)\)/);
  if (!match) continue;
  const reportPath = join(CAREER_OPS, match[1]);
  if (!existsSync(reportPath)) {
    error(`#${e.num}: Report not found: ${match[1]}`);
    brokenReports++;
  }
}
if (brokenReports === 0) ok('All report links valid');

// --- Check 4: Score format ---
let badScores = 0;
for (const e of entries) {
  const s = e.score.replace(/\*\*/g, '').trim();
  if (!/^\d+\.?\d*\/5$/.test(s) && s !== 'N/A' && s !== 'DUP') {
    error(`#${e.num}: Invalid score format: "${e.score}"`);
    badScores++;
  }
}
if (badScores === 0) ok('All scores valid');

// --- Check 5: Row format ---
let badRows = 0;
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  if (line.includes('---') || line.includes('Empresa')) continue;
  const parts = line.split('|');
  if (parts.length < 9) {
    error(`Row with <9 columns: ${line.substring(0, 80)}...`);
    badRows++;
  }
}
if (badRows === 0) ok('All rows properly formatted');

// --- Check 6: Pending TSVs ---
let pendingTsvs = 0;
if (existsSync(ADDITIONS_DIR)) {
  const files = readdirSync(ADDITIONS_DIR).filter(f => f.endsWith('.tsv'));
  pendingTsvs = files.length;
  if (pendingTsvs > 0) {
    warn(`${pendingTsvs} pending TSVs in tracker-additions/ (not merged)`);
  }
}
if (pendingTsvs === 0) ok('No pending TSVs');

// --- Check 7: Bold in scores ---
let boldScores = 0;
for (const e of entries) {
  if (e.score.includes('**')) {
    warn(`#${e.num}: Score has markdown bold: "${e.score}"`);
    boldScores++;
  }
}
if (boldScores === 0) ok('No bold in scores');

// --- Check 8: Column count (schema v2) ---
const V2_CUTOFF = '2026-06-23';
let badColCount = 0;
for (const e of entries) {
  const isNew = e.date >= V2_CUTOFF;
  if (isNew && e.colCount !== 14) {
    error(`#${e.num}: New entry (${e.date}) requires 14 columns, has ${e.colCount}`);
    badColCount++;
  } else if (!isNew && e.colCount !== 9 && e.colCount !== 14) {
    warn(`#${e.num}: Legacy entry (${e.date}) has ${e.colCount} columns (expected 9 or 14)`);
    badColCount++;
  }
}
if (badColCount === 0) ok('All column counts valid');

// --- Check 9: Vocabulary closed set (channel / source) for v2 entries ---
const VALID_CHANNELS = new Set(['portal-corp', 'portal-agg', 'email-direct', 'linkedin-msg', 'referral', 'form-web', 'unknown']);
const VALID_SOURCES = new Set(['scan', 'manual-search', 'linkedin-feed', 'cold-outreach', 'referral', 'unknown']);
let badVocab = 0;
for (const e of entries) {
  if (e.date < V2_CUTOFF) continue;
  if (e.colCount < 14) continue; // Already flagged in Check 8
  if (!VALID_CHANNELS.has(e.channel)) {
    error(`#${e.num}: Invalid channel "${e.channel}" — allowed: ${[...VALID_CHANNELS].join(' | ')}`);
    badVocab++;
  }
  if (!VALID_SOURCES.has(e.source)) {
    error(`#${e.num}: Invalid source "${e.source}" — allowed: ${[...VALID_SOURCES].join(' | ')}`);
    badVocab++;
  }
}
if (badVocab === 0) ok('All channel/source values valid');

// --- Check 10: TSV freshness ---
if (!existsSync(TSV_FILE)) {
  warn('applications.tsv not found — run merge-tracker to generate it');
} else {
  const mdStat = statSync(APPS_FILE);
  const tsvStat = statSync(TSV_FILE);
  if (tsvStat.mtimeMs < mdStat.mtimeMs) {
    warn('TSV desincronizado, ejecutar merge-tracker');
  } else {
    ok('applications.tsv is up to date');
  }
}

// --- Summary ---
console.log('\n' + '='.repeat(50));
console.log(`📊 Pipeline Health: ${errors} errors, ${warnings} warnings`);
if (errors === 0 && warnings === 0) {
  console.log('🟢 Pipeline is clean!');
} else if (errors === 0) {
  console.log('🟡 Pipeline OK with warnings');
} else {
  console.log('🔴 Pipeline has errors — fix before proceeding');
}

process.exit(errors > 0 ? 1 : 0);
