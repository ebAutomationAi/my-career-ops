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

## Pendientes

<!-- Pega aquí las ofertas del barrido (Hosco / Turijobs / InfoJobs). Ejemplo:
-->
- [x] #012 | https://www.turijobs.com/es-es/ofertas-trabajo/recepcionista-de-noche/barcelona | Grup Núñez i Navarro | Recepcionista Turno Noche | 4.2/5 | PDF ❌ | ⚠️ Verificar vigencia (careers.nyn.es → 410)
- [x] #013 | https://www.turijobs.com/es/oferta-trabajo/barcelona/recepcionista-noches/330893 | Catalonia Hotels | Recepcionista Noches | 4.2/5 | PDF ❌
- [x] #014 | https://www.turijobs.com/en-es/job/barcelona/recepcionista-nocturno/310738 | Hampton by Hilton Fira | Recepcionista Nocturno | 4.3/5 | PDF ❌

## Procesadas

<!-- Aquí van las ofertas ya evaluadas/aplicadas (movidas desde Pendientes). -->
