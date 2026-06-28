# Modo: pipeline — Bandeja de Entrada de URLs

Procesa las URLs de empleo almacenadas en `data/pipeline.md`. El usuario añade URLs en cualquier momento y luego ejecuta `/career-ops pipeline` para procesarlas todas.

## Flujo de trabajo

1. **Leer** `data/pipeline.md` → buscar elementos `- [ ]` en la sección "Pendientes"
2. **Para cada URL pendiente**:
   a. Calcular el siguiente `REPORT_NUM` secuencial (leer `reports/`, tomar el número más alto + 1)
   b. **Extraer JD** usando Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   c. Si la URL no es accesible → marcar como `- [!]` con nota y continuar
   d. **Ejecutar auto-pipeline completo**: Evaluación A-F → Informe .md → PDF (si score >= `auto_pdf_score_threshold`) → Tracker
   e. **Mover de "Pendientes" a "Procesadas"**: `- [x] #NNN | URL | Empresa | Rol | Score/5 | PDF ✅/❌`

   **Sobre el umbral de PDF (configurable):** Leer `config/profile.yml` → `auto_pdf_score_threshold`. Si la clave no existe, usar `3.0` por defecto. Si el score de evaluación es menor que el umbral, omitir la generación de PDF: escribir el informe normalmente, mostrar en la cabecera `**PDF:** no generado — ejecutar /career-ops pdf {company-slug} para crear bajo demanda`, y marcar PDF ❌ en el tracker. Si el score es ≥ al umbral, generar el PDF como de costumbre.

   **Ajuste:** Generar un PDF personalizado cuesta ~30-60s por entrada (lanzamiento de Playwright + renderizado HTML) y produce archivos que a menudo no se usan — la mayoría de roles puntúan en el rango 2.x/3.x y nunca llegan a la fase de solicitud. Subir `auto_pdf_score_threshold` (ej. `4.0`) para escribir solo el informe en ofertas marginales y generar el PDF bajo demanda con `/career-ops pdf {slug}`; establecer `0` para generar uno por cada oferta.

3. **Si hay 3+ URLs pendientes**, lanzar agentes en paralelo (herramienta Agent con `run_in_background`) para maximizar velocidad.
4. **Al final**, mostrar tabla resumen:

```
| # | Empresa | Rol | Score | PDF | Acción recomendada |
```

## Formato de pipeline.md

```markdown
## Pendientes
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: requiere login

## Procesadas
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

## Detección inteligente de JD desde URL

1. **Playwright (preferido):** `browser_navigate` + `browser_snapshot`. Funciona con todas las SPAs.
2. **WebFetch (fallback):** Para páginas estáticas o cuando Playwright no está disponible.
3. **WebSearch (último recurso):** Buscar en portales secundarios que indexan el JD.

**Casos especiales:**
- **LinkedIn**: Puede requerir login → marcar `[!]` y pedir al usuario que pegue el texto
- **PDF**: Si la URL apunta a un PDF, leerlo directamente con la herramienta Read
- **Prefijo `local:`**: Leer el archivo local. Ejemplo: `local:jds/linkedin-pm-ai.md` → leer `jds/linkedin-pm-ai.md`

## Numeración automática

1. Listar todos los archivos en `reports/`
2. Extraer el número del prefijo (ej., `142-medispend...` → 142)
3. Nuevo número = máximo encontrado + 1

## Sincronización de fuentes

Antes de procesar cualquier URL, verificar sincronización:
```bash
node cv-sync-check.mjs
```
Si hay desincronización, avisar al usuario antes de continuar.
