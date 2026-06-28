# Guía Operativa — Schema v2

> Activo desde **2026-06-23**. Referencia técnica completa: `docs/schema-v2.md`.

## 1. Flujo para nueva oferta

**Paso 1 — Evaluar** (`/career-ops oferta` o pegar URL en el chat).
El agente ejecuta los bloques A-G. En Post-evaluación escribe
`batch/tracker-additions/{num}-{slug}.tsv` con **14 columnas** (las 9 originales +
`channel`, `source`, `url`, `cv`, `cover`). Si no se conoce un valor → `unknown`.

**Paso 2 — Merge + TSV**
```
node merge-tracker.mjs --profile recepcionista
```
Actualiza `applications.md` y regenera `applications.tsv` completo (sobreescritura total).

**Paso 3 — Verificar** (recomendado antes de abrir el dashboard)
```
node verify-pipeline.mjs --profile recepcionista
```
Comprueba: 14 cols en entradas nuevas · vocabulario cerrado channel/source ·
TSV más reciente que el MD. Errores → corregir antes de proceder.

**Paso 4 — Dashboard**
```
npx serve .      # desde raíz del proyecto
# Abrir: http://localhost:3000/dashboard-v2/
```
Clic en **↻ Refresh data** para recargar el TSV sin recargar la página.
Firefox también acepta doble clic directo en `dashboard-v2/index.html`.

## 2. Comandos rápidos

| Acción | Comando |
|--------|---------|
| Evaluar oferta nueva | `/career-ops oferta` o pegar URL en el chat |
| Merge + TSV — recepcionista | `node merge-tracker.mjs --profile recepcionista` |
| Merge + TSV — formacion | `node merge-tracker.mjs --profile formacion` |
| Verificar — recepcionista | `node verify-pipeline.mjs --profile recepcionista` |
| Verificar — formacion | `node verify-pipeline.mjs --profile formacion` |
| Dashboard (servidor) | `npx serve .` → `http://localhost:3000/dashboard-v2/` |
| Dashboard (Firefox directo) | Doble clic en `dashboard-v2/index.html` |

## 3. Compatibilidad con el histórico

Las entradas con fecha < 2026-06-23 (v1 legacy) tienen columnas 10-14 vacías — correcto.
- **verify-pipeline**: acepta 9 o 14 cols para legacy; exige 14 cols y vocabulario
  cerrado solo en entradas ≥ 2026-06-23.
- **Métricas 1 y 3** (Embudo, Edad sin respuesta): incluyen legacy y v2.
- **Métricas 2 y 4** (Tasa por canal, Score × canal/fuente): excluyen entradas
  con `channel`/`source` vacíos — legacy queda fuera automáticamente.
- No hay migración retroactiva prevista.

## 4. Vocabulario de referencia

Fuentes de verdad: `templates/channels.yml` · `templates/sources.yml`

### `channel` — vehículo de envío de la candidatura

| Valor | Cuándo usarlo |
|-------|---------------|
| `portal-corp` | ATS propio de la empresa (SuccessFactors, TeamTailor, Workday, Bizneo…) |
| `portal-agg` | Portal agregador externo (InfoJobs, LinkedIn Easy Apply, Indeed, Turijobs…) |
| `email-direct` | Email directo a rrhh@, info@, o a una persona concreta |
| `linkedin-msg` | InMail o mensaje directo a recruiter en LinkedIn (NO Easy Apply) |
| `referral` | Contacto interno introdujo al candidato en la empresa |
| `form-web` | Formulario en web corporativa sin ATS detrás |
| `unknown` | No se puede determinar el canal de envío |

### `source` — origen del descubrimiento de la oferta

| Valor | Cuándo usarlo |
|-------|---------------|
| `scan` | Detectada por el escáner automático de career-ops (scan-history.tsv) |
| `manual-search` | Búsqueda manual del usuario (portales o buscadores directamente) |
| `linkedin-feed` | Vista en el feed de LinkedIn (no Easy Apply — eso va en channel) |
| `cold-outreach` | No había oferta pública; el candidato contactó a frío |
| `referral` | Contacto personal o profesional pasó la oferta al usuario |
| `unknown` | No se puede determinar el origen de la oferta |
