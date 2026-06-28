# Schema v2 — Implementación (activo desde 2026-06-23)

## Qué cambia a partir del 23/06/2026

Todas las ofertas nuevas registradas en el tracker a partir del **23/06/2026** deben incluir cinco campos adicionales que el esquema v1 no capturaba. El histórico anterior queda **congelado como legado** y no se toca.

---

## Campos exigidos en nuevas entradas

| Campo | Columna | Tipo | Valores válidos | Regla |
|-------|---------|------|-----------------|-------|
| `channel` | 10 | enum | ver tabla abajo | Cómo se envió la candidatura |
| `source` | 11 | enum | ver tabla abajo | De dónde salió la oferta |
| `url` | 12 | string | URL completa (https://...) o vacío | URL canónica de la oferta o del envío |
| `cv` | 13 | string | `v1` / `v2` / `—` | Versión del CV usada |
| `cover` | 14 | string | `yes` / `no` / `—` | Carta de presentación enviada |

### Enum: `channel` (fuente de verdad: `templates/channels.yml`)

| Valor | Cuándo usarlo |
|-------|---------------|
| `portal-corp` | ATS propio de la empresa (SuccessFactors, TeamTailor, Workday, Bizneo, Smartrecruiters cuando el subdominio es de la empresa) |
| `portal-agg` | Portal agregador externo (InfoJobs, LinkedIn Easy Apply, Indeed, Turijobs, Hosco) |
| `email-direct` | Email directo a rrhh@, info@, o a una persona concreta |
| `linkedin-msg` | InMail o mensaje directo a recruiter en LinkedIn (NO Easy Apply) |
| `referral` | Contacto interno introdujo al candidato en la empresa |
| `form-web` | Formulario en web corporativa sin ATS detrás |
| `unknown` | No se puede determinar |

### Enum: `source` (fuente de verdad: `templates/sources.yml`)

| Valor | Cuándo usarlo |
|-------|---------------|
| `scan` | Detectada por el escáner automático de career-ops (aparece en scan-history.tsv) |
| `manual-search` | Búsqueda manual del usuario (navegando portales o buscadores directamente) |
| `linkedin-feed` | Vista en el feed de LinkedIn (sin ser Easy Apply) |
| `cold-outreach` | No había oferta pública; el candidato contactó a frío |
| `referral` | Alguien (contacto personal o profesional) pasó la oferta al usuario |
| `unknown` | No se puede determinar |

**Si falta un valor:** usar `unknown` o vacío. Nunca inventar.

---

## Formato del tracker (v2)

Encabezado de `applications.md` (y todos los trackers de perfil):

```markdown
| # | Date | Company | Role | Score | Status | PDF | Report | Notes | Channel | Source | URL | CV | Cover |
```

### TSV de adición (14 columnas)

```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/...)\t{notes}\t{channel}\t{source}\t{url}\t{cv}\t{cover}
```

Columnas 1-9 son idénticas al formato v1. Las columnas 10-14 son nuevas.

---

## Qué queda congelado (legado v1)

- Todas las entradas en `applications.md` con fecha ≤ 22/06/2026 (entradas 1-18 del perfil recepcionista).
- Sus columnas 10-14 estarán **vacías** — esto es correcto, no es un error.
- No se realizará ninguna migración retroactiva.
- El sistema los trata como datos válidos con schema incompleto.

---

## Componentes que leen el nuevo formato

| Componente | Archivo | Cambio |
|------------|---------|--------|
| Dashboard (parser) | `dashboard/internal/data/career.go` | Lee campos 9-13 como opcionales; el campo URL explícito (col 12) toma precedencia sobre el enriquecimiento de 5 capas |
| Dashboard (modelo) | `dashboard/internal/model/career.go` | Nuevos campos `Channel`, `Source`, `CVVersion`, `Cover` en `CareerApplication` |
| Merge-tracker | `merge-tracker.mjs` | Parsea y escribe los 5 campos nuevos en TSVs de adición y en las nuevas filas del tracker |
| Modo evaluación | `modes/es/oferta.md` | Instruye al agente a capturar channel/source/url/cv/cover en cada nueva evaluación |

---

## Reglas de negocio

1. `channel` refleja el **vehículo de envío** (cómo se envió la candidatura).
2. `source` refleja el **origen del descubrimiento** (cómo se encontró la oferta).
3. `url` es la URL canónica de la oferta pública **o** la URL de confirmación del envío, según lo que sea más útil para el seguimiento.
4. Las entradas v1 (sin estos campos) siguen siendo válidas — el sistema las acepta sin error.
5. El dashboard distingue implícitamente las entradas v1 (campos vacíos) de las v2 (campos presentes), sin necesidad de un flag explícito de versión.

---

## Archivos modificados

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `profiles/recepcionista/data/applications.md` | User layer | Encabezado extendido con 5 columnas nuevas |
| `profiles/formacion/data/applications.md` | User layer | Encabezado extendido con 5 columnas nuevas |
| `data/applications.md` | User layer (legado) | Encabezado extendido (solo header, sin tocar filas) |
| `templates/channels.yml` | System layer | Nuevo — enum de canales (7 valores) |
| `templates/sources.yml` | System layer | Nuevo — enum de fuentes (6 valores) |
| `dashboard/internal/model/career.go` | System layer | Nuevos campos en struct CareerApplication |
| `dashboard/internal/data/career.go` | System layer | Parser lee columnas opcionales 9-13 |
| `merge-tracker.mjs` | System layer | Soporte formato 14 columnas |
| `modes/es/oferta.md` | System layer | Instrucciones actualizadas para nuevas entradas |
| `docs/schema-v2.md` | System layer | Este documento |
