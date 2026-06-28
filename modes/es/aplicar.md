# Modo: aplicar — Asistente de Solicitud en Vivo

Modo interactivo para cuando el candidato está rellenando un formulario de solicitud en Chrome. Lee lo que hay en la pantalla, carga el contexto previo del puesto y genera respuestas personalizadas para cada pregunta del formulario.

## Requisitos

- **Mejor con Playwright en modo visible**: En modo visible, el candidato ve el navegador y Claude puede interactuar con la página.
- **Sin Playwright**: el candidato comparte una captura de pantalla o pega las preguntas manualmente.

## Flujo de trabajo

```text
1. DETECTAR    → Leer pestaña activa de Chrome (captura/URL/título)
2. IDENTIFICAR → Extraer empresa + rol de la página
3. BUSCAR      → Hacer match contra informes existentes en reports/
4. CARGAR      → Leer informe completo + Sección G (si existe)
5. COMPARAR    → ¿El rol en pantalla coincide con el evaluado? Si cambió → notificar
6. ANALIZAR    → Identificar TODAS las preguntas visibles del formulario
7. GENERAR     → Para cada pregunta, generar una respuesta personalizada
8. PRESENTAR   → Mostrar respuestas formateadas para copiar y pegar
```

## Paso 1 — Detectar el puesto

**Con Playwright:** Tomar snapshot de la página activa. Leer título, URL y contenido visible.

**Sin Playwright:** Pedir al candidato que:
- Comparta una captura de pantalla del formulario (la herramienta Read puede leer imágenes)
- O pegue las preguntas del formulario como texto
- O indique empresa + rol para buscarlo

## Paso 2 — Identificar y buscar contexto

1. Extraer nombre de empresa y título del rol de la página
2. Buscar en `reports/` por nombre de empresa (grep insensible a mayúsculas)
3. Si hay match → cargar el informe completo
4. Si hay Sección G → cargar borradores previos como base
5. Si NO hay match → notificar y ofrecer ejecutar un auto-pipeline rápido

## Paso 3 — Detectar cambios en el rol

Si el rol en pantalla difiere del evaluado:
- **Notificar al candidato**: "El rol ha cambiado de [X] a [Y]. ¿Quieres que re-evalúe o que adapte las respuestas al nuevo título?"
- **Si adaptar**: Ajustar respuestas al nuevo rol sin re-evaluar
- **Si re-evaluar**: Ejecutar evaluación completa A-F, actualizar informe, regenerar Sección G
- **Actualizar tracker**: Cambiar título del rol en applications.md si aplica

## Paso 4 — Analizar preguntas del formulario

Identificar TODAS las preguntas visibles:
- Campos de texto libre (carta de presentación, por qué este rol, etc.)
- Desplegables (cómo te enteraste, autorización de trabajo, etc.)
- Sí/No (reubicación, visa, etc.)
- Campos de salario (rango, expectativa)
- Campos de subida (currículum, carta de presentación PDF)

Clasificar cada pregunta:
- **Ya respondida en la Sección G** → adaptar la respuesta existente
- **Pregunta nueva** → generar respuesta desde el informe + cv.md

## Paso 5 — Generar respuestas

Para cada pregunta, generar la respuesta siguiendo:

1. **Contexto del informe**: Usar proof points del bloque B, historias STAR del bloque F
2. **Sección G previa**: Si existe un borrador de respuesta, usarlo como base y refinarlo
3. **Tono "te elijo a ti"**: Mismo marco del auto-pipeline
4. **Especificidad**: Hacer referencia a algo concreto del JD visible en pantalla
5. **Proof point de career-ops**: Incluir en "Información adicional" si hay campo para ello

**Formato de salida:**

```text
## Respuestas para [Empresa] — [Rol]

Basado en: Informe #NNN | Score: X.X/5 | Arquetipo: [tipo]

---

### 1. [Pregunta exacta del formulario]
> [Respuesta lista para copiar y pegar]

### 2. [Siguiente pregunta]
> [Respuesta]

...

---

Notas:
- [Cualquier observación sobre el rol, cambios, etc.]
- [Sugerencias de personalización que el candidato debe revisar]
```

## Paso 5.5 — Guardar paquete de solicitud en output/pendientes/ (SIEMPRE)

Inmediatamente tras generar todas las respuestas, guardar ambos archivos en `output/pendientes/`:

1. **Carta:** `output/pendientes/apply-{num}-{slug}-{YYYY-MM-DD}.md`
2. **CV PDF:** `output/pendientes/cv-{candidato}-{slug}-{YYYY-MM-DD}.pdf`
   — mover desde `output/` con Bash si aún no está ahí

**Patrón de nombre de archivo:**
- `{num}` = número de informe con 3 dígitos y ceros a la izquierda (ej. `014`)
- `{slug}` = slug de empresa que coincide con el nombre del informe (ej. `hampton-hilton-fira`)
- `{YYYY-MM-DD}` = fecha de hoy

**Contenido del archivo:**

```markdown
# Candidatura #{num} — {Empresa} — {Rol}
**Fecha:** {YYYY-MM-DD}
**URL oferta:** {url}
**PDF CV:** output/pendientes/{nombre-pdf}.pdf

## Carta de presentación
{carta completa lista para pegar}

## Respuestas al formulario
### {Campo 1}
{respuesta}

### {Campo 2}
{respuesta}
...
```

Escribir la carta con la herramienta Write y mover el PDF del CV con Bash si es necesario — **antes** de presentar las instrucciones del formulario. Confirmar ambos nombres de archivo al usuario.

**Al confirmar el envío (Paso 6 post-solicitud):** Ejecutar:
```bash
mkdir -p "output/enviados/{num}-{slug}"
mv "output/pendientes/apply-{num}-{slug}-*.md" "output/enviados/{num}-{slug}/"
mv "output/pendientes/cv-*-{slug}-*.pdf" "output/enviados/{num}-{slug}/"
```
Luego actualizar el estado en `applications.md` a `Applied`.

## Paso 6 — Post-solicitud (opcional)

Si el candidato confirma que envió la solicitud:
1. Actualizar estado en `applications.md` de "Evaluated" a "Applied"
2. Actualizar la Sección G del informe con las respuestas finales
3. Sugerir siguiente paso: `/career-ops contacto` para outreach en LinkedIn

## Manejo del scroll

Si el formulario tiene más preguntas de las visibles:
- Pedir al candidato que haga scroll y comparta otra captura de pantalla
- O que pegue las preguntas restantes
- Procesar en iteraciones hasta cubrir el formulario completo
