#!/usr/bin/env node
/**
 * list-ready.mjs — Lista ofertas listas para enviar CV y carta
 * Filtra applications.md de cada perfil por status = "Evaluated"
 *
 * Usage:
 *   node list-ready.mjs
 *   node list-ready.mjs --profile recepcionista
 *   node list-ready.mjs --profile formacion
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const ALL_PROFILES = ['recepcionista', 'formacion'];

const args = process.argv.slice(2);
let profileArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--profile' && args[i + 1]) {
    profileArg = args[++i];
  }
}

const profiles = profileArg ? [profileArg] : ALL_PROFILES;

function parseApplications(filePath) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  const results = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 6) continue;
    if (cols[0] === '#' || cols[0] === '---') continue;
    const [num, date, company, role, score, status] = cols;
    if (status === 'Evaluated') {
      results.push({ num, date, company, role, score });
    }
  }
  return results;
}

let grandTotal = 0;

for (const perfil of profiles) {
  const appPath = join(ROOT, 'profiles', perfil, 'data', 'applications.md');
  const offers = parseApplications(appPath);

  console.log(`\n${'='.repeat(55)}`);
  console.log(`  ${perfil.toUpperCase()} — ofertas listas para enviar CV`);
  console.log('='.repeat(55));

  if (offers.length === 0) {
    console.log(`  No hay ofertas listas en perfil ${perfil}`);
    continue;
  }

  console.log(`\n  ${'#'.padEnd(4)} ${'Empresa'.padEnd(25)} ${'Score'.padEnd(7)} Fecha`);
  console.log(`  ${'-'.repeat(50)}`);
  for (const o of offers) {
    console.log(`  ${o.num.padEnd(4)} ${o.company.padEnd(25)} ${o.score.padEnd(7)} ${o.date}`);
  }
  console.log(`\n  Total: ${offers.length} oferta${offers.length !== 1 ? 's' : ''}`);
  grandTotal += offers.length;
}

if (profiles.length > 1) {
  console.log(`\n${'='.repeat(55)}`);
  console.log(`  TOTAL GLOBAL: ${grandTotal} oferta${grandTotal !== 1 ? 's' : ''} listas para enviar`);
  console.log('='.repeat(55) + '\n');
}