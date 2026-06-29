#!/usr/bin/env node
/**
 * pre-filter.mjs — Pre-filtrado de pipeline mediante guardrails del perfil.
 *
 * Usage:
 *   node pre-filter.mjs --profile recepcionista
 *   node pre-filter.mjs --profile recepcionista --dry-run
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

// ── CLI args ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const profileIdx = args.indexOf('--profile');
const dryRun = args.includes('--dry-run');

if (profileIdx === -1 || !args[profileIdx + 1]) {
  console.error('Error: --profile es obligatorio.\nUso: node pre-filter.mjs --profile <perfil> [--dry-run]');
  process.exit(1);
}

const profile = args[profileIdx + 1];
const profileMd  = path.join(ROOT, 'profiles', profile, 'modes', '_profile.md');
const pipelineMd = path.join(ROOT, 'profiles', profile, 'data', 'pipeline.md');

// ── Guardrails extraction ─────────────────────────────────────────────

function extractGuardrails(mdContent) {
  let idx = mdContent.indexOf('\n## Guardrails');
  if (idx === -1 && mdContent.startsWith('## Guardrails')) idx = 0;
  if (idx === -1) throw new Error('No se encontró sección "## Guardrails" en _profile.md');

  const section = mdContent.slice(idx);
  const yamlMatch = section.match(/```yaml\s*\n([\s\S]*?)```/);
  if (!yamlMatch) throw new Error('No se encontró bloque ```yaml en la sección ## Guardrails');

  const parsed = yaml.load(yamlMatch[1]);
  if (!parsed?.guardrails) throw new Error('El bloque YAML no contiene la clave "guardrails"');
  return parsed.guardrails;
}

// ── Pipeline parsing ──────────────────────────────────────────────────

function extractPending(mdContent) {
  return mdContent
    .split('\n')
    .filter(l => l.startsWith('- [ ]'))
    .map(line => {
      const inner = line.slice('- [ ]'.length).trim();
      const parts = inner.split('|').map(s => s.trim());
      return { url: parts[0] || '', company: parts[1] || '', title: parts[2] || '', raw: line };
    })
    .filter(item => item.url);
}

// ── HTML → plain text ─────────────────────────────────────────────────

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fetch with timeout ────────────────────────────────────────────────

const CHROME_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

async function fetchUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, { headers: CHROME_HEADERS, signal: controller.signal, redirect: 'follow' });
    return htmlToText(await res.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Scoring ───────────────────────────────────────────────────────────

function evaluate(text, guardrails) {
  const lower = text.toLowerCase();

  for (const blocker of (guardrails.hard_blockers || [])) {
    if (lower.includes(blocker.toLowerCase())) {
      return { result: 'discard', reason: `hard_blocker: "${blocker}"` };
    }
  }

  let boostScore = 0;
  const matchedBoosts = [];
  for (const b of (guardrails.boost || [])) {
    if ((b.patterns || []).some(p => lower.includes(p.toLowerCase()))) {
      boostScore += b.weight ?? 0;
      matchedBoosts.push(b.id);
    }
  }

  let penalty = 0;
  if (boostScore > 0) {
    for (const s of (guardrails.soft_blockers || [])) {
      if ((s.patterns || []).some(p => lower.includes(p.toLowerCase()))) {
        penalty += s.weight ?? 0;
      }
    }
  }  
  const scoreFinal = boostScore - penalty;
  const minScore = guardrails.min_boost_score ?? 0;

  if (scoreFinal >= minScore) return { result: 'pass', score: scoreFinal, matchedBoosts };
  return { result: 'discard', reason: `low_score: ${scoreFinal} < ${minScore}`, score: scoreFinal };
}

// ── Pipeline update ───────────────────────────────────────────────────

function updatePipeline(mdContent, discarded) {
  const rawSet = new Set(discarded.map(d => d.raw));

  const remaining = mdContent
    .split('\n')
    .filter(l => !rawSet.has(l))
    .join('\n')
    .trimEnd();

  const moved = discarded
    .map(({ url, company, title, reason }) =>
      `- [x] ${url} | ${company} | ${title} [pre-filter: ${reason}]`
    )
    .join('\n');

  return remaining + '\n' + moved + '\n';
}

// ── Sleep ─────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  let profileContent, pipelineContent;

  try { profileContent  = readFileSync(profileMd,  'utf8'); }
  catch { console.error(`No se puede leer: ${profileMd}`); process.exit(1); }

  try { pipelineContent = readFileSync(pipelineMd, 'utf8'); }
  catch { console.error(`No se puede leer: ${pipelineMd}`); process.exit(1); }

  let guardrails;
  try { guardrails = extractGuardrails(profileContent); }
  catch (err) { console.error(`Error guardrails: ${err.message}`); process.exit(1); }

  const pending = extractPending(pipelineContent);
  if (pending.length === 0) {
    console.log('No hay URLs pendientes en pipeline.md.');
    process.exit(0);
  }

  console.log(`\nPre-filter [profile: ${profile}]${dryRun ? ' [dry-run]' : ''}`);
  console.log(`Procesando ${pending.length} URL(s) pendiente(s)...\n`);

  const results = [];

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    process.stdout.write(`[${i + 1}/${pending.length}] ${item.url}\n`);

    const text = await fetchUrl(item.url);

    if (text === null) {
      process.stdout.write(`  → error_fetch\n\n`);
      results.push({ ...item, result: 'error_fetch', reason: 'error_fetch' });
    } else {
      const ev = evaluate(text, guardrails);
      if (ev.result === 'discard') {
        process.stdout.write(`  → DESCARTADA (${ev.reason})\n\n`);
      } else {
        const boosts = ev.matchedBoosts.join(', ') || 'ninguno';
        process.stdout.write(`  → PASA  score=${ev.score}  boosts=[${boosts}]\n\n`);
      }
      results.push({ ...item, ...ev });
    }

    if (i < pending.length - 1) await sleep(2_000);
  }

  // ── Summary ───────────────────────────────────────────────────────

  const passed    = results.filter(r => r.result === 'pass');
  const discHard  = results.filter(r => r.result === 'discard' && r.reason?.startsWith('hard_blocker'));
  const discLow   = results.filter(r => r.result === 'discard' && r.reason?.startsWith('low_score'));
  const fetchErrs = results.filter(r => r.result === 'error_fetch');

  const SEP = '─'.repeat(58);
  console.log('═'.repeat(58));
  console.log('RESUMEN');
  console.log(SEP);
  console.log(`Total procesadas:            ${results.length}`);
  console.log(`Descartadas (hard_blocker):  ${discHard.length}`);
  console.log(`Descartadas (low_score):     ${discLow.length}`);
  console.log(`Errores fetch:               ${fetchErrs.length}`);
  console.log(`Pasadas a evaluación:        ${passed.length}`);

  const discarded = [...discHard, ...discLow];

  if (discarded.length > 0) {
    console.log(`\n── Descartadas ${SEP.slice(15)}`);
    for (const r of discarded) {
      console.log(`  [${r.reason}]`);
      console.log(`    ${r.company} — ${r.title}`);
      console.log(`    ${r.url}`);
    }
  }

  if (passed.length > 0) {
    console.log(`\n── Pasadas (por score desc) ${SEP.slice(27)}`);
    for (const r of [...passed].sort((a, b) => b.score - a.score)) {
      const boosts = r.matchedBoosts.join(', ') || 'ninguno';
      console.log(`  score=${r.score}  boosts=[${boosts}]`);
      console.log(`    ${r.company} — ${r.title}`);
      console.log(`    ${r.url}`);
    }
  }

  // ── Write ─────────────────────────────────────────────────────────

  if (!dryRun && discarded.length > 0) {
    const updated = updatePipeline(pipelineContent, discarded);
    writeFileSync(pipelineMd, updated, 'utf8');
    console.log(`\n✓ pipeline.md actualizado — ${discarded.length} entrada(s) movidas a ## Procesadas.`);
  } else if (dryRun) {
    console.log(`\n[dry-run] Sin cambios en archivos.`);
  }
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
