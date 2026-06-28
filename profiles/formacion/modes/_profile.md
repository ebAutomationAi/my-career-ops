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
