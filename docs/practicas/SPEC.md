# SPEC.md â€” Hotel PMS Simulator: Barcelona Night Audit Training

## 1. Concepto & VisiÃ³n

Un simulador web inmersivo que replica la experiencia de trabajar con un Property Management System (PMS) en un hotel de Barcelona. No es un tutorial pasivo, sino un entorno interactivo donde puedes practicar el flujo completo del Night Audit, desde la revisiÃ³n de disponibilidad hasta el cÃ¡lculo de KPIs. La interfaz evoca la estÃ©tica profesional de sistemas como Opera o Mews pero con un enfoque pedagÃ³gico que guÃ­a al usuario a travÃ©s de cada paso, ofreciendo feedback en tiempo real y generando escenarios realistas del mercado hotelero barcelonÃ©s.

## 2. Design Language

### Aesthetic Direction
Inspirado en dashboards de hotelero profesional: limpio, funcional, con toques de elegancia mediterrÃ¡nea. Combina la seriedad de un sistema empresarial con la calidez del hospitality industry. Paleta de colores que evoca la arquitectura modernista de Barcelona (azules profundos, naranjas cÃ¡lidos, blancos luminosos).

### Color Palette
- **Primary**: `#1B4D89` (Azul corporativo hotelero)
- **Secondary**: `#2D5A87` (Azul profundo mediterrÃ¡neo)
- **Accent**: `#E67E22` (Naranja Barcelona - para alertas y CTAs)
- **Success**: `#27AE60` (Verde confirmaciÃ³n)
- **Warning**: `#F39C12` (Ãmbar precauciÃ³n)
- **Danger**: `#E74C3C` (Rojo incidencias)
- **Background**: `#F8FAFC` (Gris muy claro)
- **Surface**: `#FFFFFF` (Blanco puro para cards)
- **Text Primary**: `#1E293B` (Gris oscuro)
- **Text Secondary**: `#64748B` (Gris medio)
- **Border**: `#E2E8F0` (Gris sutil)

### Typography
- **Headings**: "Plus Jakarta Sans" (700, 600)
- **Body**: "Inter" (400, 500)
- **Monospace**: "JetBrains Mono" â€” Para nÃºmeros de habitaciÃ³n
- **Fallback**: system-ui, sans-serif

### Motion Philosophy
- Transiciones de estado: 200ms ease-out
- ApariciÃ³n de elementos: 300ms ease-out con fade
- Modales: 250ms ease-out scale desde 0.95
- Tablas con datos: Stagger de 30ms entre filas

## 3. Layout & Structure

### Arquitectura de PÃ¡gina
- Header compacto (64px) con logo, fecha y usuario
- Navigation tabs horizontales para mÃ³dulos principales
- Ãrea principal con contenido variable segÃºn pestaÃ±a activa
- Footer sticky con tips contextuales y progreso

### Responsive Strategy
- Desktop (>1024px): Layout completo
- Tablet (768-1024px): Grid adaptativo 2 columnas
- Mobile (<768px): Stack vertical

## 4. Features & Interactions

### 4.1 Grid de Disponibilidad
- 80 habitaciones distribuidas en 8 pisos
- Estados: Libre, Ocupada, Sucia, Out of Order, Bloqueada
- Drag & drop para cambiar estados
- Click para ver detalles del huÃ©sped
- Filtros por tipo, piso, estado

### 4.2 MÃ³dulo de Transacciones
- Lista de movimientos del dÃ­a
- Tipos: Room, Minibar, Restaurant, Bar, Tourism Tax
- Filtros y totales por categorÃ­a
- Estados: Pendiente, Confirmada, Cancelada

### 4.3 MÃ³dulo de Caja
- Panel de efectivo con denominaciones
- Panel de TPV (4 terminals)
- Alertas de discrepancia PMS vs TPV
- Zona de ajustes y motivos

### 4.4 Dashboard de KPIs
- ADR: Ingresos / Habitaciones vendidas
- RevPAR: Ingresos / Habitaciones disponibles
- OcupaciÃ³n: %
- Comparativa con dÃ­as anteriores

### 4.5 GestiÃ³n de Incidencias
- 10 escenarios pre-configurados
- Decisiones interactivas con feedback
- Impacto en ocupaciÃ³n e ingresos

### 4.6 MÃ³dulo de Cumplimiento (Barcelona)
- Parte de Viajeros (Mossos d'Esquadra)
- Tasa TurÃ­stica con exenciones
- ValidaciÃ³n de documentos

### 4.7 Checklist Night Audit
- Tareas por franja horaria
- Timer visual de fases
- Recursos de ayuda en cada paso
- Progress bar global

## 5. Technical Approach

### Stack
- Vanilla JavaScript + ES6 Modules
- CSS Custom Properties
- LocalStorage para persistencia
- Chart.js para grÃ¡ficos

### Data Model

**Room:**
```javascript
{
  id: "201",
  type: "standard" | "suite",
  floor: 2,
  status: "available" | "occupied" | "dirty" | "ooo" | "blocked",
  guest: { name, lastName, nationality, docType, docNumber, checkIn, checkOut, balance },
  notes: []
}
```

**Transaction:**
```javascript
{
  id: "TXN-001",
  roomId: "201",
  type: "room" | "minibar" | "restaurant" | "bar" | "tourism_tax",
  amount: 150.00,
  status: "pending" | "confirmed" | "cancelled",
  timestamp: "2024-01-15T14:30:00"
}
```

## 6. Contenido Educativo Integrado

- Tooltips educativos en cada elemento
- Enlaces a documentaciÃ³n de PMS reales
- Scenarios del dÃ­a para prÃ¡ctica inmersiva