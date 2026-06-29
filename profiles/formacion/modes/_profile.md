# _profile.md — Perfil: Formación Profesional

## Identidad profesional

**Nombre:** Enrico Claudio Bonometti ("Kiko")
**Rol objetivo:** Docente en Formación Profesional / Formador TIC
**Ubicación:** Barcelona | Remoto | Híbrido

## Arquetipo principal

Formador tecnológico con +20 años de experiencia IT que combina base técnica sólida (IT Manager, SAP, infraestructura) con experiencia docente real: formación ofimática a equipos comerciales, clases de idiomas personalizadas, monitor de natación. Habilitado para la docencia en FP (SSCE0110 grados A, B, C).

## Proof points clave

- **SSCE0110** — Certificado de Profesionalidad, habilitación docente grados A, B, C
- **Affinity Petcare 15 años** — Formador interno de Office/SAP a equipos de 50+ personas
- **IT Manager Bossini** — Gestión técnica completa: redes, software, hardware
- **IFCD0110** — Confección y publicación web
- **Master Blockchain + Fullstack** — Actualización tecnológica reciente
- **Multilingüe** — Italiano nativo, castellano fluido, inglés intermedio, catalán básico

## Áreas de interés docente (por prioridad)

1. Informática / Ofimática (Word, Excel, PowerPoint, SAP)
2. Transformación digital y herramientas digitales
3. Administración y gestión (procesos Order-to-Cash, ERP)
4. Idiomas (italiano nativo)
5. Tecnologías web (IFCD0110)

## Deal-breakers

- Sin habilitación LOMLOE requerida (solo SSCE0110 disponible)
- Sin presencialidad fuera de Barcelona (máx 30 min transporte público)
- Sin roles que exijan experiencia docente reglada >3 años sin aceptar equivalencia

## Scoring weights (formacion)

- **A — Arquetipo fit:** habilitación exigida vs disponible, área temática alineada
- **B — Condiciones:** modalidad (online/híbrido/presencial), horario, contrato
- **C — Empresa:** reputación, seriedad, accesibilidad
- **D — Compensación:** tarifa/hora o salario bruto anual
- **E — Crecimiento:** posibilidad de ampliar horas/materias, estabilidad

## Narrativa de candidatura

"Formador con base IT real, no solo pedagógica. He formado equipos en entornos corporativos exigentes (Affinity Petcare, 15 años) y tengo la habilitación SSCE0110 que acredita mi competencia docente. Traigo la mentalidad de quien ha resuelto problemas técnicos complejos y sabe explicarlos de forma que la gente los entiende y los aplica."

## Instrucciones de evaluación para Gemini

> Usa estos criterios exclusivamente. Ignora los archetypes tecnológicos
> de oferta.md (FDE, SA, PM, LLMOps, Agentic, Transformation).
> No aplican a este perfil.

### Archetypes válidos
- Docente FP ciclos formativos IT / informática
- Formador TIC corporativo
- Profesor de certificados de profesionalidad con SSCE0110
- Formador IA / automatización / datos
- Tutor de formación para el empleo
- Instructor de herramientas digitales, programación o sistemas

### Criterios de puntuación

| Score | Condición |
|-------|-----------|
| 5.0 | Docencia FP o FPE + materia IT/IA + contrato estable + sin deal-breakers |
| 4.5 | Docencia FP o FPE + materia IT/IA + gap menor (parcial o temporal corto) |
| 4.0 | Formación corporativa o no reglada + materia claramente IT/IA + condiciones aceptables |
| 3.0 | Encaje parcial, materia compatible o potencial real de transición |
| 2.0 | Señales débiles de encaje o varias condiciones flojas |
| 1.0 | Fuera de perfil o con varios deal-breakers |

**Threshold:** score >= 3.5 → Evaluated. score < 3.5 → Discarded.

### Deal-breakers automáticos (score = 1.0)
- Materia sin relación con IT/IA/digital (automoción, peluquería, cocina, estética, mecánica)
- Prácticas, becario o sin remuneración
- Oferta fuera de Barcelona sin opción híbrida o remota
- Especialidad incompatible con perfil técnico ni con docencia IT/IA

### Deal-breakers fuertes (penalizan, no descartan automáticamente)
- Requiere habilitación LOMLOE y no acepta SSCE0110 ni equivalencias
- Exige presencia total sin flexibilidad y con desplazamiento largo
- Pide certificaciones técnicas concretas no sustituibles por experiencia

### Señales positivas
- FP, ciclo formativo, grado medio o superior
- Certificado de profesionalidad / SSCE0110 / Grados A, B, C
- Materia IT: informática, programación, sistemas, redes, bases de datos
- Materia IA: inteligencia artificial, machine learning, big data, automatización
- Modalidad remota o híbrida
- Jornada parcial compatible
- Centro de formación, academia TIC o consultora formativa

## Guardrails

```yaml
guardrails:
  min_boost_score: 3

  hard_blockers:
    - "comercial"
    - "ventas"
    - "hostelería"
    - "camarero"
    - "cocina"
    - "limpieza"
    - "almacén"
    - "reparto"
    - "mozo"
    - "atención al cliente"
    - "marketing"
    - "administrativo"
    - "recepcionista"
    - "call center"
    - "dependiente"
    - "teleoperador"
    - "promotor"
    - "prácticas"
    - "becario"
    - "sin experiencia"
    - "formación no reglada"
    - "automoción"
    - "soldadura"
    - "electricidad industrial"
    - "fontanería"
    - "peluquería"
    - "estética"
    - "mecánica"

  soft_blockers:
    - id: low_fit_generic
      patterns:
        - "soporte técnico"
        - "helpdesk"
        - "microinformática"
        - "técnico de usuarios"
        - "mesa de ayuda"
      weight: 1
      reason: "Útil solo si no hay mejores opciones"

    - id: non_target_services
      patterns:
        - "limpieza de oficinas"
        - "dependencia"
        - "cuidados"
        - "cuidado de mayores"
        - "seguridad privada"
        - "conserje"
      weight: 2
      reason: "Sectores fuera del objetivo"

  boost:
    - id: ia_ai
      patterns:
        - "inteligencia artificial"
        - "IA"
        - "AI"
        - "machine learning"
        - "deep learning"
        - "big data"
        - "datos"
        - "data"
        - "LLM"
        - "agentes IA"
        - "orquestación"
        - "automatización"
        - "prompt engineering"
        - "n8n"
        - "make"
        - "zapier"
        - "power automate"
      weight: 3
      reason: "IA, datos y automatización"

    - id: fp_docencia
      patterns:
        - "FP"
        - "formación profesional"
        - "ciclo formativo"
        - "grado superior"
        - "grado medio"
        - "docente"
        - "profesor"
        - "formador"
        - "tutor"
        - "certificado de profesionalidad"
        - "habilitación docente"
        - "SSCE0110"
      weight: 3
      reason: "Docencia FP / certificación docente"

    - id: it_core
      patterns:
        - "informática"
        - "programación"
        - "sistemas"
        - "redes"
        - "bases de datos"
        - "ciberseguridad"
        - "cloud"
        - "devops"
        - "python"
        - "sql"
        - "api"
        - "backend"
        - "software"
        - "administración de sistemas"
        - "telemática"
      weight: 2
      reason: "Perfil técnico IT"

    - id: remote_hybrid
      patterns:
        - "remoto"
        - "remote"
        - "híbrido"
        - "hybrid"
        - "teletrabajo"
      weight: 1
      reason: "Formato remoto/híbrido"

    - id: partial_hours
      patterns:
        - "parcial"
        - "media jornada"
        - "horas semanales"
        - "part-time"
        - "part time"
      weight: 1
      reason: "Compatible con jornada parcial"
```
