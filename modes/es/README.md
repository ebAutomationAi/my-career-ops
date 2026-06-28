# Modos en Español — career-ops

Este directorio contiene los modos del sistema traducidos al español para candidatos que buscan empleo en mercados hispanohablantes (España, Latinoamérica) o que prefieren trabajar en español.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `_shared.md` | Contexto compartido: reglas globales, scoring, herramientas |
| `oferta.md` | Evaluación completa de oferta (bloques A-G) |
| `aplicar.md` | Asistente de solicitud en vivo |
| `pipeline.md` | Procesamiento del inbox de URLs |

## Cuándo usar estos modos

- El usuario busca empleo en España o Latinoamérica
- La oferta de trabajo está en español
- El usuario prefiere trabajar en español
- Se ha configurado `language.modes_dir: modes/es` en `config/profile.yml`

## Cuándo NO usar estos modos

Si el usuario aplica a ofertas en inglés, usar los modos por defecto en `modes/` — aunque la empresa sea española o latinoamericana. La preferencia explícita del usuario o `language.modes_dir` en `config/profile.yml` siempre prevalece sobre la detección automática.
