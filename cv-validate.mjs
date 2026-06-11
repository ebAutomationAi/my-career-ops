#!/usr/bin/env node

/**
 * cv-validate.mjs — Gate de validación antes de generar PDF del CV.
 *
 * NO es un detector de mentiras. Es un detector de SEÑALES DE RIESGO.
 * La verificación factual final es responsabilidad del usuario.
 *
 * Niveles:
 *   ERROR   (exit 1) → objetivo y verificable; BLOQUEA generación de PDF
 *   WARNING (exit 0) → subjetivo o mejorable; informa pero no bloquea
 *
 * Uso:
 *   node cv-validate.mjs                          # valida cv.md
 *   node cv-validate.mjs path/to/cv.md            # valida archivo específico
 *   node cv-validate.mjs cv.md --strict           # warnings cuentan como errores
 *   node cv-validate.mjs cv.md --profile config/profile.yml  # cross-check
 *
 * Exit codes:
 *   0 → CV válido (o solo warnings sin --strict)
 *   1 → CV inválido (errores, o warnings con --strict)
 *   2 → error de ejecución (archivo no encontrado, etc.)
 */

import { readFileSync, existsSync } from 'fs';
import yaml from 'js-yaml';

// ── Config ──────────────────────────────────────────────────────────

const MIN_CV_LENGTH = 800;        // caracteres; CV más corto = stub sospechoso
const CURRENT_YEAR = new Date().getFullYear();

// Frases vagas sin soporte métrico. Lista conservadora: solo marca lo que
// suele señalar relleno, no lenguaje legítimo. Es WARNING, no ERROR.
const VAGUE_CLAIMS = [
  'garantizando',
  'garantiza',
  'altos estándares',
  'world-class',
  'de clase mundial',
  'excelencia',
  'best-in-class',
  'mejor de su clase',
  'liderazgo probado',
  'amplia experiencia',
  'profundo conocimiento',
  'gran capacidad',
];

// Verbos de acción que IDEALMENTE van acompañados de una métrica cercana.
// Si aparecen sin ningún número en la misma línea → warning suave.
const ACTION_VERBS_NEEDING_METRICS = [
  'gestión de',
  'gestioné',
  'administré',
  'resolución de',
  'coordiné',
  'mantenimiento de',
];

// ── Parsing de argumentos ───────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { strict: false, profile: null, cvPath: 'cv.md' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--strict') {
      flags.strict = true;
    } else if (arg === '--profile') {
      flags.profile = args[++i] || null;
    } else if (arg === '--pdf') {
      // Aceptado por compatibilidad con la REGLA MAESTRA de _profile.md
      // (node cv-validate.mjs <html> --pdf <pdf>). El PDF no se valida aquí;
      // solo se ignora el argumento para no romper el comando documentado.
      i++;
    } else if (!arg.startsWith('-')) {
      flags.cvPath = arg;
    }
  }
  return flags;
}

// ── Validadores individuales ────────────────────────────────────────
// Cada uno recibe el contexto y empuja a errors[] o warnings[].

// ERROR: el archivo debe existir y no estar vacío
function checkExists(ctx) {
  if (!existsSync(ctx.cvPath)) {
    ctx.errors.push(`Archivo no encontrado: ${ctx.cvPath}`);
    return false;
  }
  return true;
}

// ERROR: longitud mínima — un CV de 3 líneas no es entregable
function checkLength(ctx) {
  const len = ctx.content.trim().length;
  if (len < MIN_CV_LENGTH) {
    ctx.errors.push(
      `CV demasiado corto (${len} caracteres, mínimo ${MIN_CV_LENGTH}). ` +
      `¿Está completo?`
    );
  }
}

// ERROR: años futuros. Un CV con "2027" es un error objetivo (typo o invención).
// Excepción: el año actual y "Presente"/"Actualidad" son válidos.
function checkFutureYears(ctx) {
  // Captura años de 4 dígitos entre 19xx y 20xx
  const yearMatches = ctx.content.match(/\b(19|20)\d{2}\b/g) || [];
  const futureYears = [...new Set(yearMatches)]
    .map(Number)
    .filter(y => y > CURRENT_YEAR);

  for (const y of futureYears) {
    ctx.errors.push(
      `Año futuro detectado: ${y} (año actual: ${CURRENT_YEAR}). ` +
      `Corrige el typo o usa "Presente" para roles en curso.`
    );
  }
}

// ERROR: datos de contacto expuestos. El CV.md fuente NO debe llevar email
// ni teléfono hardcoded — se inyectan desde profile.yml en build. Esto evita
// fugas si cv.md se versiona en git.
function checkExposedContact(ctx) {
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRe = /(?:\+34[\s-]?)?(?:\d[\s-]?){9}/g;

  const emails = ctx.content.match(emailRe) || [];
  // Filtra ejemplos/placeholders obvios
  const realEmails = emails.filter(e =>
    !/example\.com|tu\.email|your\.email|placeholder/i.test(e)
  );
  if (realEmails.length > 0) {
    ctx.errors.push(
      `Email expuesto en CV fuente: ${realEmails[0]}. ` +
      `Quítalo de cv.md; inyéctalo desde config/profile.yml en build.`
    );
  }

  const phones = ctx.content.match(phoneRe) || [];
  // Un teléfono real tiene 9+ dígitos; filtra coincidencias de años/IDs cortos
  const realPhones = phones.filter(p => p.replace(/\D/g, '').length >= 9);
  if (realPhones.length > 0) {
    ctx.errors.push(
      `Teléfono expuesto en CV fuente: ${realPhones[0].trim()}. ` +
      `Quítalo de cv.md; inyéctalo desde config/profile.yml en build.`
    );
  }
}

// WARNING: afirmaciones vagas sin soporte
function checkVagueClaims(ctx) {
  const lower = ctx.content.toLowerCase();
  const found = new Set();
  for (const claim of VAGUE_CLAIMS) {
    if (lower.includes(claim)) found.add(claim);
  }
  for (const claim of found) {
    ctx.warnings.push(
      `Afirmación vaga: "${claim}". Sustituye por un dato concreto ` +
      `(número, rango, resultado verificable) o elimínala.`
    );
  }
}

// WARNING: líneas con verbo de acción pero sin ninguna cifra
function checkMetricsPresence(ctx) {
  const lines = ctx.content.split('\n');
  let bulletsWithoutMetric = 0;
  let totalBullets = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-') && !trimmed.startsWith('*')) continue;
    totalBullets++;

    const lowerLine = trimmed.toLowerCase();
    const hasActionVerb = ACTION_VERBS_NEEDING_METRICS.some(v => lowerLine.includes(v));
    const hasNumber = /\d/.test(trimmed);

    if (hasActionVerb && !hasNumber) {
      bulletsWithoutMetric++;
    }
  }

  if (totalBullets > 0) {
    const ratio = bulletsWithoutMetric / totalBullets;
    if (ratio > 0.5) {
      ctx.warnings.push(
        `${bulletsWithoutMetric} de ${totalBullets} viñetas con verbo de acción ` +
        `no tienen ninguna cifra. Añade métricas donde sea verificable.`
      );
    }
  }
}

// WARNING (opcional): cross-check contra profile.yml
// Verifica que al menos un keyword de cada archetype primary aparezca en el CV.
function checkProfileAlignment(ctx) {
  if (!ctx.profile) return;

  const archetypes = ctx.profile.archetypes || [];
  if (archetypes.length === 0) return;

  const lowerCv = ctx.content.toLowerCase();

  // Normaliza tildes para comparación robusta:
  // "auditoría" == "auditoria", "nocturna" == "nocturna"
  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  const normalizedCv = normalize(ctx.content);

  for (const arch of archetypes) {
    // Solo evalúa archetypes con fit definido
    const fit = arch.fit || 'adjacent';

    // thematic_axes = habilidades funcionales reales (lo que haces)
    // keywords = títulos del rol (lo que eres)
    // Para primary/secondary: buscar en thematic_axes (transferibles)
    // Para adjacent: buscar en keywords (necesitas evidencia del título)
    const axes = (arch.thematic_axes || []).map(normalize);
    const keywords = (arch.keywords || []).map(normalize);

    if (fit === 'adjacent') {
      // Para roles de estiramiento: al menos 1 keyword del título debe aparecer
      if (keywords.length === 0) continue;
      const anyMatch = keywords.some(k => normalizedCv.includes(k));
      if (!anyMatch) {
        ctx.warnings.push(
          `Archetype adjacent "${arch.name || arch.id}": el CV no menciona ` +
          `ningún keyword de este rol (${keywords.slice(0, 3).join(', ')}). ` +
          `Para roles de estiramiento, conviene al menos mencionar la habilidad clave.`
        );
      }
      continue;
    }

    // Para primary y secondary: buscar thematic_axes (habilidades transferibles)
    if (axes.length > 0) {
      const MATCH_THRESHOLD = 2; // mínimo de ejes funcionales que deben aparecer
      const matchCount = axes.filter(ax => normalizedCv.includes(ax)).length;
      if (matchCount < MATCH_THRESHOLD) {
        const missing = axes.filter(ax => !normalizedCv.includes(ax));
        ctx.warnings.push(
          `Archetype ${fit} "${arch.name || arch.id}": el CV cubre ` +
          `${matchCount}/${axes.length} ejes funcionales. ` +
          `Ejes no encontrados: ${missing.slice(0, 3).join(', ')}. ` +
          `Considera hacerlos más visibles.`
        );
      }
      continue;
    }

    // Fallback: si no hay thematic_axes definidos, no avisa para primary/secondary
    // (el candidato aspira al rol, no necesariamente lo ha tenido antes)
    // Solo avisa si no hay NINGUNA evidencia (ni axes ni keywords)
    if (keywords.length > 0) {
      const anyMatch = keywords.some(k => normalizedCv.includes(k));
      if (!anyMatch) {
        ctx.warnings.push(
          `Archetype ${fit} "${arch.name || arch.id}": no se encontró ningún ` +
          `keyword ni eje funcional en el CV. ` +
          `Si es un rol objetivo legítimo, añade thematic_axes en profile.yml ` +
          `para que el validador evalúe habilidades en lugar de títulos.`
        );
      }
    }
  }
}
// ── Carga de profile.yml (opcional) ─────────────────────────────────

function loadProfile(profilePath) {
  if (!profilePath) return null;
  if (!existsSync(profilePath)) {
    return { _loadError: `profile no encontrado: ${profilePath}` };
  }
  try {
    return yaml.load(readFileSync(profilePath, 'utf-8'));
  } catch (err) {
    return { _loadError: `profile inválido: ${err.message}` };
  }
}

// ── Main ────────────────────────────────────────────────────────────

function main() {
  const flags = parseArgs(process.argv);

  const ctx = {
    cvPath: flags.cvPath,
    content: '',
    profile: null,
    errors: [],
    warnings: [],
  };

  // Gate 1: existencia (si falla, no tiene sentido seguir)
  if (!checkExists(ctx)) {
    printResults(ctx, flags);
    process.exit(2);
  }

  ctx.content = readFileSync(ctx.cvPath, 'utf-8');

  // Carga profile si se pidió cross-check
  if (flags.profile) {
    const profile = loadProfile(flags.profile);
    if (profile && profile._loadError) {
      ctx.warnings.push(profile._loadError);
    } else {
      ctx.profile = profile;
    }
  }

  // Ejecuta validadores
  checkLength(ctx);
  checkFutureYears(ctx);
  checkExposedContact(ctx);
  checkVagueClaims(ctx);
  checkMetricsPresence(ctx);
  checkProfileAlignment(ctx);

  printResults(ctx, flags);

  // Exit logic
  const hasErrors = ctx.errors.length > 0;
  const strictFail = flags.strict && ctx.warnings.length > 0;
  process.exit(hasErrors || strictFail ? 1 : 0);
}

function printResults(ctx, flags) {
  console.log('\n=== cv-validate ===\n');
  console.log(`Archivo: ${ctx.cvPath}`);
  if (flags.strict) console.log('Modo: STRICT (warnings cuentan como errores)');

  if (ctx.errors.length === 0 && ctx.warnings.length === 0) {
    console.log('\n✓ CV válido. Sin errores ni warnings.');
    console.log('\nRecordatorio: este validador detecta señales de riesgo, no');
    console.log('verifica que los hechos sean ciertos. Esa verificación es tuya.\n');
    return;
  }

  if (ctx.errors.length > 0) {
    console.log(`\nERRORES (${ctx.errors.length}) — bloquean generación de PDF:`);
    ctx.errors.forEach(e => console.log(`  ✗ ${e}`));
  }

  if (ctx.warnings.length > 0) {
    console.log(`\nWARNINGS (${ctx.warnings.length}) — revisar pero no bloquean:`);
    ctx.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  console.log('');
}

main();
