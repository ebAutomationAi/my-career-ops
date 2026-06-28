# Guardrails Spec

## Ubicación
Cada perfil define sus guardrails en:
`profiles/{perfil}/modes/_profile.md` → sección `## Guardrails`

El bloque YAML va dentro de un fenced code block con language `yaml`.

## Formato

```yaml
guardrails:
  min_boost_score: 3

  hard_blockers:
    - "keyword exacto"
    - "otro keyword"

  soft_blockers:
    - id: nombre_identificador
      patterns:
        - "pattern 1"
        - "pattern 2"
      weight: 1
      reason: "Explicación corta"

  boost:
    - id: nombre_identificador
      patterns:
        - "pattern 1"
        - "pattern 2"
      weight: 2
      reason: "Explicación corta"
```

## Lógica de evaluación

1. Extraer texto plano del JD.
2. Buscar hard_blockers con match case-insensitive por substring.
3. Cualquier match en hard_blockers = DESCARTAR.
4. Calcular boost_score como la suma de weights de cada boost con al menos un pattern match.
5. Calcular penalty como la suma de weights de cada soft_blocker con al menos un pattern match.
6. score_final = boost_score - penalty.
7. Si score_final >= min_boost_score, la oferta PASA a evaluación.
8. Si score_final < min_boost_score, la oferta se DESCARTA por low score.

## Uso

```bash
node pre-filter.mjs --profile recepcionista [--dry-run]
```

Sin --dry-run: mover descartadas a ## Procesadas en pipeline.md con nota [pre-filter: motivo].
Con --dry-run: solo mostrar el resumen sin modificar archivos.
