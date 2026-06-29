# Pipeline — Inbox de ofertas pendientes

<!--
FORMATO (una oferta por línea, bajo "## Pendientes"):
  - [ ] URL | nombre del hotel | título de la oferta

REGLAS:
- La URL va SIEMPRE justo después de "- [ ]" (scan.mjs la usa para dedup).
- [ ] = pendiente de evaluar/aplicar.  [x] = ya procesada (o muévela a Procesadas).
- Solo apuntar: hoteles ≤4★ y recepción noche / night auditor en Barcelona.
- Evitar ofertas con "inglés alto imprescindible" (mismo bloqueo que Calderón).
- Procesar el lote con: modo pipeline → evalúa A-G y escribe TSV en
  batch/tracker-additions/ ; luego node merge-tracker.mjs.
-->

- [x] #005 | https://jobs.smartrecruiters.com/AccorHotel/postings/744000130504911 | Accor (Ibis Budget BCN) | Front Office Supervisor | 3.2/5 | PDF ❌
- [x] #006 | https://jobs.smartrecruiters.com/AccorHotel/postings/744000130193629 | Accor/Ennismore (SLS BCN) | Night Auditor | 3.5/5 | PDF ❌
- [x] #007 | https://jobs.smartrecruiters.com/AccorHotel/postings/744000129706356 | Accor/Ennismore (SLS BCN) | Front Office Agent | 3.2/5 | PDF ❌
- [x] #008 | https://jobs.smartrecruiters.com/AccorHotel/postings/744000126283639 | Accor (Ibis Budget BCN) | Front Office Team Leader | 3.0/5 | PDF ❌ | ⚠️ Verificar vigencia (Open Day 2024)

- [x] #009 | https://careers.melia.com/job/Barcelona-Guest-Service-Line-Agent-%28Contrato-de-sustituci%C3%B3n%29-Torre-Melina-A-Gran-Meli%C3%A1-Hotel/1401931933/ | Meliá (Torre Melina 5★) | Guest Service Line Agent | 3.0/5 | PDF ❌
- [x] #010 | https://careers.melia.com/job/Barcelona-Front-Office-Assistant-Meli%C3%A1-Barcelona-Sky/1391833633/ | Meliá Barcelona Sky 4★ | Front Office Assistant | 3.8/5 | PDF ❌
- [x] #011 | https://careers.melia.com/job/Barcelona-Front-Office-Agent-Torre-Melina-a-Gran-Melia-Hotel/1287064701/ | Meliá (Torre Melina 5★) | Front Office Agent | 3.0/5 | PDF ❌

- [x] https://careers.melia.com/job/Barcelona-Front-Office-Agent-Meli%C3%A1-Barcelona-Sarri%C3%A0/1403361633/ | Meliá Hotels | Front Office Agent - Meliá Barcelona Sarrià | ⛔ 2.0/5 — 5★ + inglés alto imprescindible → NO APLICAR
- [x] https://careers.melia.com/job/Barcelona-Front-Office-Agent-INNSIDE-by-Meli%C3%A1-Barcelona-Aeropuerto/1398112833/ | Meliá Hotels | Front Office Agent - INNSIDE by MeliÃ¡ Barcelona Aeropuerto | ❌ DESCARTADA (aeropuerto)
- [x] https://jobs.grupohotusa.com/job/EXE-PARC-DEL-VALLES-%2812%29-Recepcionista-Hotel-4-Cerdanyola-del-Vall%C3%A8s-Barc-EXE-PARC-D/1362486457/ | Hotusa / Eurostars | Recepcionista Hotel 4* - Cerdanyola del VallÃ¨s | ❌ DESCARTADA (fuera Barcelona - Cerdanyola)
- [x] https://jobs.grupohotusa.com/job/EUROSTARS-MONUMENTAL-%2851%29-Recepcionista-Hotel-4-Barcelona-Barc-EUROSTARS/1361815357/ | Hotusa / Eurostars | Recepcionista Hotel 4* - Barcelona | ❌ DESCARTADA (5★ hotel)
- [x] https://jobs.grupohotusa.com/job/EXE-BARBERA-PARC-%2832%29-Recepcionista-Hotel-4-Barc-EXE-BARBER/1361695757/ | Hotusa / Eurostars | Recepcionista Hotel 4* | ❌ DESCARTADA (fuera Barcelona - Barberà)

- [x] https://careers.melia.com/job/Barcelona-Recepcionista-MIM-Sitges/1382281533/ | Meliá Hotels | Recepcionista - MIM Sitges
- [x] https://jobs.smartrecruiters.com/AccorHotel/postings/744000126282364 | Accor | Recepcionista- Ibis budget Barcelona Center
- [x] https://jobs.smartrecruiters.com/AccorHotel/postings/744000124826349 | Accor | Recepcionista Polivalente

- [x] https://jobs.orbio.work/vincci-hoteles/recepcionista-hotel-vincci-mae-4-barcelona/c9ad4db9-df44-4b31-9b25-78d4ce089d8c | Vincci Hoteles | Recepcionista Hotel Vincci Mae 4* Barcelona | ❌ DESCARTADA (filtro inglés B2 — screening no superable)

- [ ] https://careers.melia.com/job/Barcelona-Front-Office-Agent-INNSIDE-by-Meli%C3%A1-Barcelona-Apolo/1406437033/ | Meliá Hotels | Front Office Agent - INNSIDE by MeliÃ¡ Barcelona Apolo
- [ ] https://careers.melia.com/job/Barcelona-Recepcionista-de-Noche-Meli%C3%A1-Barcelona-Sarri%C3%A0/1403361633/ | Meliá Hotels | Recepcionista de Noche - MeliÃ¡ Barcelona SarriÃ
- [ ] https://jobs.grupohotusa.com/job/EXE-PLAZA-CATALUNYA-%28256-01%29-Recepcionista-Dorma-Plaza-Catalunya-4-Barc-EXE-PLAZA/1364860657/ | Hotusa / Eurostars | Recepcionista Dorma Plaza Catalunya 4*
- [ ] https://jobs.grupohotusa.com/job/EUROSTARS-CRISTAL-PALACE-%284%29-Recepcionista-Eurostars-Cristal-Palace-4-Barc-EUROSTARS/1364452757/ | Hotusa / Eurostars | Recepcionista Eurostars Cristal Palace 4*

- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/auditor-nocturno-recepcion-hotel-4/334824 | Selenta Group | AUDITOR NOCTURNO RECEPCIÓN- HOTEL 4*
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/auditora-nocturno-room-mate-barcelona/333344 | Room Mate Hotels | Auditor/a Nocturno - Room Mate Barcelona
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/front-office-supervisor-torre-melina-a-gran-melia-hotel/339556 | Meliá Hotels International | Front Office Supervisor - Torre Melina a Gran Melia Hotel
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-noche-melia-barcelona-sarria/339546 | Meliá Hotels International | Recepcionista de Noche - Meliá Barcelona Sarrià
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/night-auditor-novotel-barcelona-city/333597 | Novotel Barcelona City | Night Auditor – Novotel Barcelona City
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/front-office-agent-innside-barcelona-apolo/338867 | Meliá Hotels International | Front Office Agent -  INNSIDE Barcelona Apolo
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-mf/338400 | Grupo Mayerling | Recepcionista (m/f)
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-hotel-4-con-experiencia/337184 | Aparthotel Mariano Cubí | Recepcionista de Hotel 4* con experiencia
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-mercure-barcelona-condor/336005 | Panoram Hotel Management | Recepcionista Hotel Mercure Barcelona Condor
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-con-experiencia-en-hoteles-urbanos-centro-ciudad-en-barcelona/333762 | Chic & Basic Hotels | Recepcionista con experiencia en Hoteles urbanos centro ciudad en Barcelona
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-4/334093 | Grupo Hotusa | Recepcionista Hotel 4*
- [ ] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-dorma-plaza-catalunya-4/339986 | Grupo Hotusa | Recepcionista Dorma Plaza Catalunya 4*

## Pendientes

<!-- Pega aquí las ofertas del barrido (Hosco / Turijobs / InfoJobs). Ejemplo:
-->
- [x] #012 | https://www.turijobs.com/es-es/ofertas-trabajo/recepcionista-de-noche/barcelona | Grup Núñez i Navarro | Recepcionista Turno Noche | 4.2/5 | PDF ❌ | ⚠️ Verificar vigencia (careers.nyn.es → 410)
- [x] #013 | https://www.turijobs.com/es/oferta-trabajo/barcelona/recepcionista-noches/330893 | Catalonia Hotels | Recepcionista Noches | 4.2/5 | PDF ❌
- [x] #014 | https://www.turijobs.com/en-es/job/barcelona/recepcionista-nocturno/310738 | Hampton by Hilton Fira | Recepcionista Nocturno | 4.3/5 | PDF ❌

## Procesadas

<!-- Aquí van las ofertas ya evaluadas/aplicadas (movidas desde Pendientes). -->
- [x] https://euamcareers.minorhotels.com/job/Barcelona-Recepcionista-NH-Collection-Barcelona-Gran-Hotel-Calder%C3%B3n/1364903457/ | Minor Hotels | Recepcionista - NH Collection Barcelona Gran Hotel Calderón [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/front-office-agent/336000 | SLS Barcelona | Front Office Agent [pre-filter: hard_blocker: "5 estrellas"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-con-experiencia-para-hotel-4-estrellas-superior-centro-barcelona/334654 | Alexandra Barcelona Hotel | Recepcionista con experiencia para Hotel 4 estrellas superior centro Barcelona [pre-filter: hard_blocker: "3 años de experiencia"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-mf-ac-hotel-diagonal-illa/339838 | ACHM Hotels by Marriott | Recepcionista (m/f) - AC Hotel Diagonal Illa [pre-filter: hard_blocker: "luxury"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/j1-front-desk-lennox-hotel-miami-beach/337568 | Yurbban Hospitality Group | J1 Front Desk – Lennox Hotel [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-barcelona-no-temporada/337953 | Sinenger Consulting Selección de Personal | RECEPCIONISTA HOTEL BARCELONA  - no temporada [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/assistente-recepcionista-hoteleroa-incorporacion-inmediata-centro-de-barcelona/335736 | Hotel Ginebra Barcelona | Assistente Recepcionista Hotelero/a – Incorporación Inmediata – Centro de Barcelona [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionistafront-desk-agent-individual-reservations-ac-victoria-suites-hotel-4/337364 | AC Victoria Suites Hotel by Marriott | Recepcionista/Front Desk Agent & Individual reservations - AC Victoria Suites Hotel 4* [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-hotel-correturnos/338772 | Nuñez i Navarro Hotels | Recepcionista de Hotel - Correturnos [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hostel/337772 | Hostel | Recepcionista Hostel [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-noches/339470 | Catalonia Hotels & Resorts | Recepcionista noches [pre-filter: hard_blocker: "inglés alto"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/guest-relations-recepcionista/336799 | Serras Collection | Guest relations (Recepcionista) [pre-filter: hard_blocker: "luxury"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-3-en-el-centro-de-barcelona-vacaciones/338568 | One Shot Hotels | Recepcionista Hotel 3* en el centro de Barcelona (Vacaciones) [pre-filter: hard_blocker: "inglés alto"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel/336689 | Catalonia Hotels & Resorts | Recepcionista Hotel [pre-filter: hard_blocker: "inglés alto"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-en-h10-casanova/339370 | H10 Hotels | Recepcionista en H10 Casanova [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-temporal-nh-barcelona-stadium/338811 | Minor Hotels Europe & Americas | Recepcionista (temporal) - NH Barcelona Stadium [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-noche-hotel/336770 | Hoteles Garbí | Recepcionista Noche _Hotel [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/h-la-paloma-boutique-recepcionista-turno-tardenoche-de-duracion-determinada/335419 | H La Paloma | H La Paloma Boutique Recepcionista turno tarde/noche de duración determinada [pre-filter: hard_blocker: "3 años de experiencia"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-mim-sitges/334368 | Meliá Hotels International | Recepcionista - MIM Sitges [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-para-hotel-boutique-en-centro-de-barcelona/335296 | Bondia Hotels | Recepcionista para Hotel Boutique en centro de Barcelona [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-hotel-4sup/333262 | Hotel Indigo Barcelona - Plaza Catalunya InterContinental | Recepcionista de hotel 4*SUP [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-eurostars-cristal-palace-4/339398 | Grupo Hotusa | Recepcionista Eurostars Cristal Palace 4* [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-sustitucion-temporal-baja-paternidad/340196 | Radisson Hotel Group | Recepcionista – Sustitución Temporal (baja paternidad) [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-spagym-soho-house-barcelona/339925 | Soho House & Co | Recepcionista Spa/Gym - Soho House Barcelona [pre-filter: hard_blocker: "dominio del inglés"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-front-desk-hotel-occidental-diagonal-414/335224 | Barceló Hotel Group | Recepcionista Hotel (Front Desk) - Hotel Occidental Diagonal 414 [pre-filter: hard_blocker: "inglés alto"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-hotel-room-mate-barcelona/333579 | Room Mate Hotels | Recepcionista de Hotel - Room Mate Barcelona [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-hotel-25h/340107 | Catalonia Hotels & Resorts | Recepcionista Hotel 25h [pre-filter: hard_blocker: "inglés alto"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-en-h10-marina-barcelona/339872 | H10 Hotels | Recepcionista en H10 Marina Barcelona [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-nh-collection-barcelona-gran-hotel-calderon/340144 | Minor Hotels Europe & Americas | Recepcionista - NH Collection Barcelona Gran Hotel Calderón [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/front-office-agent-torre-melina-a-gran-melia-hotel/333093 | Meliá Hotels International | Front Office Agent - Torre Melina a Gran Melia Hotel [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-novotel-barcelona-city/333596 | Novotel Barcelona City | Recepcionista – Novotel Barcelona City [pre-filter: hard_blocker: "hostel"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-de-hotel-mf/334675 | Hotel Gaudí | Recepcionista de hotel (m/f) [pre-filter: hard_blocker: "inglés imprescindible"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-en-cadena-hotelera-barcelona-ingles-intermedio/334585 | Ibis Plaza Glories 22@ | Recepcionista en Cadena hotelera, Barcelona, Inglés Intermedio [pre-filter: hard_blocker: "dominio del inglés"]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-para-cobertura-de-vacaciones-3-meses-junio-julio-y-agosto-diurno/333497 | Chic & Basic Hotels | Recepcionista para cobertura de vacaciones (3 meses: Junio, Julio y Agosto). Diurno. [pre-filter: hard_blocker: "hostel"]
- [x] https://careers.melia.com/job/Barcelona-Front-Office-Supervisor-Torre-Melina-a-Gran-Melia-Hotel/1407404033/ | Meliá Hotels | Front Office Supervisor - Torre Melina a Gran Melia Hotel [pre-filter: low_score: 0 < 2]
- [x] https://jobs.smartrecruiters.com/AccorHotel/postings/744000132636692 | Accor | Front Office Supervisor- Ibis budget Barcelona Center [pre-filter: low_score: 0 < 2]
- [x] https://www.turijobs.com/es-es/oferta-trabajo/barcelona/recepcionista-polivalente/335795 | Alcamtravels | Recepcionista polivalente [pre-filter: low_score: 1 < 2]
