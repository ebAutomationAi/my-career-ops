import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SYNC_FILE = resolve(ROOT, '.claude', 'last-sync.txt');
writeFileSync(SYNC_FILE, new Date().toISOString());
console.log('✓ Sincronización registrada:', new Date().toISOString());
