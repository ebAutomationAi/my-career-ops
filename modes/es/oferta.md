# Modo: oferta — Evaluación Completa A-G

Cuando el candidato pega una oferta (texto o URL), SIEMPRE entregar los 7 bloques (evaluación A-F + legitimidad G):

## Paso 0 — Detección de Arquetipo

Clasificar la oferta en uno de los 6 arquetipos (ver `_shared.md`). Si es híbrido, indicar los 2 más cercanos. Esto determina:
- Qué proof points priorizar en el bloque B
- Cómo reescribir el resumen en el bloque E
- Qué historias STAR preparar en el bloque F

## Bloque A — Resumen del Rol

Tabla con:
- Arquetipo detectado
- Dominio (platform/agentic/LLMOps/ML/enterprise)
- Función (construir/consultar/gestionar/desplegar)
- Seniority
- Remoto (completo/híbrido/presencial)
- Tamaño del equipo (si se menciona)
- TL;DR en 1 frase

## Bloque B — Match con CV

Leer `cv.md`. Crear una tabla con cada requisito del JD mapeado a líneas exactas del CV.

**Adaptado al arquetipo:**
- Si FDE → priorizar velocidad de entrega y proof points cara al cliente
- Si SA → priorizar diseño de sistemas e integraciones
- Si PM → priorizar product discovery y métricas
- Si LLMOps → priorizar evals, observabilidad, pipelines
- Si Agentic → priorizar multi-agent, HITL, orquestación
- Si Transformation → priorizar gestión del cambio, adopción, escalado

Sección de **Gaps** con estrategia de mitigación para cada uno:
1. ¿Es un bloqueador duro o un nice-to-have?
2. ¿Puede el candidato demostrar experiencia adyacente?
3. ¿Hay un proyecto del portfolio que cubra este gap?
4. Plan de mitigación concreto (frase para carta de presentación, proyecto rápido, etc.)

## Bloque C — Nivel y Estrategia

1. **Nivel detectado** en el JD vs **nivel natural del candidato para ese arquetipo**
2. **Plan "vender senior sin mentir"**: frases específicas adaptadas al arquetipo, logros concretos a destacar, cómo posicionar la experiencia de fundador como ventaja
3. **Plan "si me bajan de nivel"**: aceptar si la compensación es justa, negociar revisión a 6 meses, criterios claros de promoción

## Bloque D — Compensación y Demanda

Usar WebSearch para:
- Salarios actuales para el rol (Glassdoor, Levels.fyi, Blind, InfoJobs, LinkedIn Salary)
- Reputación de compensación de la empresa
- Tendencia de demanda para el rol

Tabla con datos y fuentes citadas. Si no hay datos, indicarlo en lugar de inventar.

## Bloque E — Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---------|---------------|-----------------|---------|
| 1 | Resumen | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 cambios en el CV + Top 5 cambios en LinkedIn para maximizar el match.

## Bloque F — Plan de Entrevista

6-10 historias STAR+R mapeadas a requisitos del JD (STAR + **Reflexión**):

| # | Requisito JD | Historia STAR+R | S | T | A | R | Reflexión |
|---|-------------|-----------------|---|---|---|---|-----------|

La columna **Reflexión** captura lo aprendido o lo que se haría diferente. Señala seniority — candidatos junior describen lo que pasó, candidatos senior extraen lecciones.

**Banco de Historias:** Si existe `interview-prep/story-bank.md`, comprobar si alguna de estas historias ya está ahí. Si no, añadir las nuevas. Con el tiempo esto construye un banco reutilizable de 5-10 historias maestras adaptables a cualquier pregunta de entrevista.

**Seleccionadas y encuadradas según el arquetipo:**
- FDE → enfatizar velocidad de entrega y cara al cliente
- SA → enfatizar decisiones arquitectónicas
- PM → enfatizar discovery y trade-offs
- LLMOps → enfatizar métricas, evals, hardening en producción
- Agentic → enfatizar orquestación, manejo de errores, HITL
- Transformation → enfatizar adopción, cambio organizacional

También incluir:
- 1 caso de estudio recomendado (cuál de sus proyectos presentar y cómo)
- Preguntas red-flag y cómo responderlas (ej., "¿por qué vendiste tu empresa?", "¿tienes equipo a cargo?")

## Bloque G — Legitimidad de la Oferta

Analizar la oferta para identificar señales de si es una vacante real y activa. Ayuda al usuario a priorizar su esfuerzo en oportunidades que realmente van a contratar.

**Encuadre ético:** Presentar observaciones, no acusaciones. Cada señal tiene explicaciones legítimas. El usuario decide cómo ponderarlas.

### Señales a analizar (en orden):

**1. Frescura de la Oferta** (del snapshot de Playwright, ya capturado en el Paso 0):
- Fecha de publicación o "hace X días" — extraer de la página
- Estado del botón Aplicar (activo / cerrado / ausente / redirige a página genérica)
- Si la URL redirigió a página genérica de empleo, notarlo

**2. Calidad de la Descripción** (del texto JD):
- ¿Nombra tecnologías, frameworks, herramientas específicas?
- ¿Menciona tamaño del equipo, estructura de reporte o contexto organizacional?
- ¿Son realistas los requisitos? (años de experiencia vs antigüedad de la tecnología)
- ¿Hay un alcance claro para los primeros 6-12 meses?
- ¿Se menciona salario/compensación?
- ¿Qué proporción del JD es específica del rol vs boilerplate genérico?
- ¿Hay contradicciones internas? (título junior + requisitos de staff, etc.)

**3. Señales de Contratación de la Empresa** (2-3 consultas WebSearch, combinar con investigación del Bloque D):
- Buscar: `"{empresa}" despidos {año}` — notar fecha, escala, departamentos
- Buscar: `"{empresa}" congelación de contratación {año}` — notar anuncios
- Si hay despidos: ¿son en el mismo departamento que este rol?

**4. Detección de Reposteo** (de scan-history.tsv):
- Comprobar si empresa + título de rol similar apareció antes con una URL diferente
- Notar cuántas veces y en qué período

**5. Contexto de Mercado del Rol** (cualitativo, sin consultas adicionales):
- ¿Es un rol común que normalmente se cubre en 4-6 semanas?
- ¿Tiene sentido el rol para el negocio de esta empresa?
- ¿Es el nivel de seniority uno que legítimamente tarda más en cubrirse?

### Formato de salida:

**Evaluación:** Uno de tres niveles:
- **Alta Confianza** — Múltiples señales sugieren una vacante real y activa
- **Proceder con Cautela** — Señales mixtas que vale la pena notar
- **Sospechosa** — Múltiples indicadores de oferta fantasma, investigar antes de invertir tiempo

**Tabla de señales:** Cada señal observada con su hallazgo y peso (Positivo / Neutro / Preocupante).

**Notas de Contexto:** Cualquier caveat (rol de nicho, empleo público, posición evergreen, etc.) que explique señales potencialmente preocupantes.

### Manejo de casos límite:
- **Ofertas públicas/académicas:** Plazos más largos son estándar. Ajustar umbrales (60-90 días es normal).
- **Ofertas evergreen/contratación continua:** Si el JD dice explícitamente "continuo" o "rolling", notarlo como contexto — no es una oferta fantasma, es un rol pipeline.
- **Roles de nicho/ejecutivos:** Staff+, VP, Director, o roles muy especializados legítimamente permanecen abiertos meses. Ajustar umbrales de antigüedad en consecuencia.
- **Startup / pre-revenue:** Empresas en etapa temprana pueden tener JDs vagos porque el rol está genuinamente indefinido. Ponderar menos la vaguedad de descripción.
- **Sin fecha disponible:** Si la antigüedad de la oferta no se puede determinar y no hay otras señales preocupantes, usar "Proceder con Cautela" con nota de datos limitados. NUNCA usar "Sospechosa" sin evidencia.
- **Sourcing directo (sin oferta pública):** Señales de frescura no disponibles. Notar que el contacto activo del reclutador es en sí mismo una señal positiva de legitimidad.

---

## Post-evaluación

**SIEMPRE** tras generar los bloques A-G:

### 1. Guardar informe .md

Guardar evaluación completa en `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = siguiente número secuencial (3 dígitos, con ceros a la izquierda)
- `{company-slug}` = nombre de empresa en minúsculas, sin espacios (usar guiones)
- `{YYYY-MM-DD}` = fecha actual

**Formato del informe:**

```markdown
# Evaluación: {Empresa} — {Rol}

**Fecha:** {YYYY-MM-DD}
**URL:**
**Arquetipo:** {detectado}
**Score:** {X/5}
**Legitimidad:** {Alta Confianza | Proceder con Cautela | Sospechosa}
**PDF:** {ruta o pendiente}

---

## A) Resumen del Rol
(contenido completo del bloque A)

## B) Match con CV
(contenido completo del bloque B)

## C) Nivel y Estrategia
(contenido completo del bloque C)

## D) Compensación y Demanda
(contenido completo del bloque D)

## E) Plan de Personalización
(contenido completo del bloque E)

## F) Plan de Entrevista
(contenido completo del bloque F)

## G) Legitimidad de la Oferta
(contenido completo del bloque G)

## H) Borradores de Respuestas al Formulario
(solo si score >= 4.5 — borradores de respuestas para el formulario de solicitud)

---

## Keywords extraídas
(lista de 15-20 keywords del JD para optimización ATS)
```

### 2. Registrar en el tracker

**SIEMPRE** registrar en `data/applications.md` (o `profiles/{perfil}/data/applications.md`):
- Siguiente número secuencial
- Fecha actual
- Empresa
- Rol
- Score: media del match (1-5)
- Estado: `Evaluated`
- PDF: ❌ (o ✅ si el auto-pipeline generó PDF)
- Informe: enlace relativo al .md (ej., `[001](reports/001-empresa-2026-01-01.md)`)
- Notas: resumen de 1 línea
- **Canal (`channel`):** cómo se envió la candidatura — `portal-corp` / `portal-agg` / `email-direct` / `linkedin-msg` / `referral` / `form-web` / `unknown`
- **Fuente (`source`):** de dónde salió la oferta — `scan` / `manual-search` / `linkedin-feed` / `cold-outreach` / `referral` / `unknown`
- **URL:** URL canónica de la oferta o del envío (si se conoce, si no: vacío)
- **CV:** versión del CV usada (ej. `v1`, `v2`, o `—` si no aplica aún)
- **Cover:** carta de presentación enviada (`yes` / `no` / `—`)

> **Regla v2 (desde 2026-06-23):** los campos channel, source, url, cv y cover son **obligatorios** para nuevas entradas. Si no se conoce un valor, usar `unknown` o dejar vacío — nunca inventar.

**Formato del tracker (desde 2026-06-23):**

```markdown
| # | Fecha | Empresa | Rol | Score | Estado | PDF | Informe | Notas | Canal | Fuente | URL | CV | Carta |
```

**TSV de adición (formato v2, 14 columnas):**

```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/...)\t{notes}\t{channel}\t{source}\t{url}\t{cv}\t{cover}
```
