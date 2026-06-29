# Perfil — Enrico Claudio Bonometti (Kiko)

Búsqueda activa: recepción nocturna en hoteles de Barcelona ciudad y
L'Hospitalet de Llobregat.

## Archetypes objetivo (cobertura amplia)

### Recepción noche — puesto principal
- Recepcionista nocturno / Recepcionista nocturna
- Recepcionista de noche
- Recepcionista turno noche / turno nocturno
- Recepcionista hotel noche
- Recepcionista 3er turno
- Recep. noche / Recep. nocturno/a
- Recepción noche / Recepción nocturna
- Recepcionista mix tarde-noche / mix tardes y noches
- Night Receptionist
- Night Front Desk Agent
- Front Desk Agent night shift
- Front Desk Night Shift
- Hotel Night Receptionist
- Overnight Front Desk

### Night Auditor / Auditor nocturno
- Night Auditor
- Night Audit
- NA (Night Auditor)
- Auditor nocturno / Auditor de noche / Auditor noche hotel
- Auditoría nocturna
- Cierre nocturno hotel
- Auditor turno noche

### Front Office turno noche
- Front Office Agent noche / FOA noche
- Agente Front Office noche
- Agente de recepción noche
- Guest Service Agent noche
- Guest Experience Agent noche

### Recepción general (filtrar por turno)
- Recepcionista hotel / hostelería / alojamiento
- Recepcionista apartahotel / hostal / hospedaje / pensión
- Atención al cliente hotel
- Customer Service hotel

### Sistemas / IT en hostelería (turno noche)
- Sistemas hostelería
- Soporte IT hotel / Soporte informático hotel
- Helpdesk hostelería / IT Helpdesk hotelería
- Técnico de sistemas hotel / Técnico IT hotel
- Hotel IT
- PMS Support / Soporte PMS / Soporte Opera PMS
- Operador de sistemas turno noche

### Cercanos al perfil noche
- Conserje nocturno / Conserje noche hotel / Concierge nocturno
- Night Manager (solo si no requiere 5★ ni experiencia management)
- Night Operations
- Overnight Hotel Staff

## Reglas de evaluación

- PRIORIDAD: SOLO turno noche explícito o mix tarde-noche
- DESCARTAR: recepción diurna (cualquier turno que no incluya noche)
- DESCARTAR: hoteles 5★ / luxury / lujo
- DESCARTAR: ofertas que exijan inglés "nivel alto" o "dominio"
- ACEPTAR: hoteles 1★, 2★, 3★, 4★ en Barcelona ciudad y L'Hospitalet de
  Llobregat
- ACEPTAR también: hostales, apartahoteles, pensiones, hospedajes
- IDIOMAS aceptados en oferta: castellano, catalán, italiano, inglés
- THRESHOLD de aplicación: aplicar solo si score ≥ 4/5

## Narrativa profesional

### Bossini Srl — Brescia, Italia (1987 - 2000, 13 años)
Experiencia continuada en sistemas:
- Autonomía técnica
- Gestión IT
- Resolución de problemas bajo presión

### Restaurante — Brescia, Italia
Cofundador y gestor de restaurante (1999-2002) en horario partido (nocturno: 21:00-03:00 / diurno: 10:00), encargándome de:
Cierre y apertura del local, gestión de caja, resolución de incidencias contables y atención al cliente.
Desarrollé una aplicación Windows para gestión de reservas:
Gestión de mesas (asignación, estado en tiempo real, capacidad).
Reservas (alta, modificación, cancelación, búsqueda por cliente/fecha/turno).
Planning visual por servicio (comida/cena).
Histórico de clientes (datos, preferencias, frecuencia).
Integración con cierre de caja.
Aporta:
Conocimiento práctico de la lógica de un PMS (estructura de datos, flujos, casos de uso).
Capacidad de aprender herramientas como Opera, Sihot o Mews en días, no semanas.
Autonomía total: diseñé, mantuve y operé el sistema, similar al perfil de un night auditor que resuelve incidencias sin soporte.

Trabajo nocturno real y continuado:
- En paralelo a Bossini: 1999 - finales 1999
- Solo restaurante: enero 2000 - octubre 2002

Horario y responsabilidades:
- Apertura: 21:00
- Cierre: ~03:00
- Cierre de caja del restaurante
- Resolución de incidencias contables relacionadas con procedimientos  de caja
- Resolución de incidencias con clientes en sala (atención al público,
  gestión de problemas)
- Dejar el local cerrado y listo para la mañana siguiente
- Apertura mañana 10:00: apertura del día y gestión de caja

Aporta:
- Experiencia continuada en horario nocturno largo (~6 horas por
  servicio + apertura matutina)
- Conocimiento conceptual directo de cómo funciona un PMS hotelero
  (estructura de datos, flujos, casos de uso reales)
- Capacidad de aprender Opera / Sihot / Protel / Mews / Cloudbeds en
  días, no semanas — la lógica subyacente ya la he diseñado e  implementado
- Autonomía total: apertura + cierre por la misma persona
- Gestión de caja completa (apertura y cierre)
- Atención al cliente bajo presión
- Fiabilidad demostrada para turnos no convencionales

## Idiomas

- Italiano: nativo
- Castellano: alto
- Catalán: funcional
- Inglés: funcional

## Estatus laboral
-  Nacionalidad italiana (UE)
- Sin restricciones laborales en España
- Residencia: Barcelona
- Disponibilidad inmediata

## Guardrails

```yaml
guardrails:
  min_boost_score: 2

  hard_blockers:
    - "inglés alto"
    - "inglés avanzado"
    - "english advanced"
    - "C1 english"
    - "native english"
    - "fluent english"
    - "inglés imprescindible"
    - "dominio del inglés"
    - "catalán nativo"
    - "català natiu"
    - "catalán imprescindible"
    - "5 estrellas"
    - "cinco estrellas"
    - "luxury"
    - "gran lujo"
    - "hotel de lujo"
    - "3 años de experiencia"
    - "experiencia mínima de 3 años"
    - "experiencia mínima 3 años"
    - "mínimo 3 años"
    - "at least 3 years"
    - "aeropuerto"
    - "airport"
    - "El Prat"
    - "gran meliá"

    - "sitges"

  soft_blockers: []

  boost:
    - id: night_shift
      patterns:
        - "noche"
        - "nocturno"
        - "nocturna"
        - "night auditor"
        - "night shift"
        - "turno de noche"
      weight: 2
      reason: "Turno noche preferido"

    - id: systems_it
      patterns:
        - "PMS"
        - "Opera"
        - "sistemas"
        - "informática"
        - "soporte técnico"
      weight: 1
      reason: "Menciona sistemas/IT"

    - id: mid_star
      patterns:
        - "3 estrellas"
        - "4 estrellas"
        - "3*"
        - "4*"
      weight: 1
      reason: "Hotel 3-4★"

    - id: permanent_contract
      patterns:
        - "indefinido"
        - "permanent"
        - "estable"
      weight: 1
      reason: "Contrato indefinido"
```
