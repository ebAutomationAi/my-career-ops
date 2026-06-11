#!/usr/bin/env bash
# =============================================================================
# token-guard.sh — PreToolUse hook para subag_haiku_sonnet_opus
#
# Dos funciones:
#   1. AVISO:   imprime en stderr el nombre de la herramienta antes de operar.
#   2. BLOQUEO: si el coste estimado del día supera el límite, sale con exit 2
#               para que Claude Code detenga la operación.
#
# CONFIGURACIÓN (env vars, pon en ~/.bashrc o ~/. zshrc):
#   SUBAG_DAILY_LIMIT   Límite en USD/día. Default: 1.00
#   SUBAG_GUARD_TOOLS   Herramientas que disparan el chequeo de coste.
#                       Default: "Task Bash WebFetch"
#   SUBAG_THROTTLE_SECS Segundos entre lecturas de transcripts. Default: 60
#   CLAUDE_CONFIG_DIR   Si moviste ~/.claude a otro sitio (ya lo lee cost_report)
#
# SEGURIDAD:
#   - Solo lectura: no hace red, no escribe archivos de proyecto.
#   - Escribe únicamente en /tmp (caché efímera de coste).
#   - exit 0 = permite; exit 2 = bloquea (con mensaje a stderr).
#   - Funciona con o sin jq; usa python3 como fallback.
#   - Cualquier error interno → exit 0 (fail-open: no bloquea por bug del hook).
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Configuración
# ---------------------------------------------------------------------------
DAILY_LIMIT="${SUBAG_DAILY_LIMIT:-1.00}"
# Herramientas que disparan el chequeo de coste (separadas por espacio):
GUARD_TOOLS="${SUBAG_GUARD_TOOLS:-Task Bash WebFetch}"
THROTTLE_SECS="${SUBAG_THROTTLE_SECS:-60}"

# Ruta a cost_report.py, relativa al directorio de este hook.
# Hook:   <proyecto>/.claude/hooks/token-guard.sh
# Script: <proyecto>/scripts/cost_report.py
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
COST_REPORT="$HOOK_DIR/../../scripts/cost_report.py"

# Archivo caché en /tmp (evita parsear todos los JSONL en cada herramienta).
# Incluye un hash del hook para que proyectos distintos no compartan caché.
_HASH="$(echo "$HOOK_DIR" | cksum | cut -d' ' -f1)"
CACHE_FILE="/tmp/subag_cost_cache_${_HASH}.json"

# ---------------------------------------------------------------------------
# 1. Leer el evento que Claude Code envía por stdin
# ---------------------------------------------------------------------------
EVENT="$(cat)"   # JSON: {"tool_name":"Task","tool_input":{...}, ...}

# Extraer tool_name (jq si existe, python3 como fallback)
if command -v jq &>/dev/null; then
    TOOL_NAME="$(echo "$EVENT" | jq -r '.tool_name // empty' 2>/dev/null || true)"
else
    TOOL_NAME="$(echo "$EVENT" | python3 -c \
        "import sys, json; d=json.load(sys.stdin); print(d.get('tool_name',''))" \
        2>/dev/null || true)"
fi

# ---------------------------------------------------------------------------
# 2. Aviso siempre visible (comportamiento original, no bloquea)
# ---------------------------------------------------------------------------
if [[ -n "$TOOL_NAME" ]]; then
    echo "[token-guard] herramienta: $TOOL_NAME" >&2
fi

# ---------------------------------------------------------------------------
# 3. Comprobar si esta herramienta está en la lista de vigiladas
# ---------------------------------------------------------------------------
TOOL_GUARDED=0
for T in $GUARD_TOOLS; do
    if [[ "$TOOL_NAME" == "$T" ]]; then
        TOOL_GUARDED=1
        break
    fi
done

[[ "$TOOL_GUARDED" -eq 0 ]] && exit 0   # herramienta no vigilada → permitir

# ---------------------------------------------------------------------------
# 4. Obtener coste del día (con caché para no parsear JSONL en cada llamada)
# ---------------------------------------------------------------------------
_now=$(date +%s)
_cache_ok=0

if [[ -f "$CACHE_FILE" ]]; then
    _cache_ts="$(python3 -c \
        "import json,sys; d=json.load(open('$CACHE_FILE')); print(d.get('ts',0))" \
        2>/dev/null || echo 0)"
    _age=$(( _now - _cache_ts ))
    if [[ "$_age" -lt "$THROTTLE_SECS" ]]; then
        _cache_ok=1
    fi
fi

if [[ "$_cache_ok" -eq 0 ]]; then
    # Regenerar caché: ejecutar cost_report.py y guardar resultado
    if python3 "$COST_REPORT" --days 1 --json > "$CACHE_FILE.tmp" 2>/dev/null; then
        # Añadir timestamp al JSON antes de guardar
        python3 - "$CACHE_FILE.tmp" "$CACHE_FILE" <<'PYEOF'
import json, sys, time
with open(sys.argv[1]) as f:
    d = json.load(f)
d["ts"] = int(time.time())
with open(sys.argv[2], "w") as f:
    json.dump(d, f)
PYEOF
        rm -f "$CACHE_FILE.tmp"
    else
        # cost_report falló (p. ej. ~/.claude vacío en primer uso) → permitir
        echo "[token-guard] aviso: no se pudo calcular coste del día, se permite la operación" >&2
        exit 0
    fi
fi

# ---------------------------------------------------------------------------
# 5. Comparar coste diario con el límite
# ---------------------------------------------------------------------------
_cost_today="$(python3 -c \
    "import json; d=json.load(open('$CACHE_FILE')); print(f\"{d.get('total',{}).get('cost', 0.0):.4f}\")" \
    2>/dev/null || echo "0.0000")"

# Comparación en python (bash no maneja floats)
_over="$(python3 -c \
    "print(1 if float('$_cost_today') >= float('$DAILY_LIMIT') else 0)" \
    2>/dev/null || echo "0")"

if [[ "$_over" -eq 1 ]]; then
    cat >&2 <<EOF
╔══════════════════════════════════════════════════════════╗
║  [token-guard] BLOQUEO — Límite diario alcanzado         ║
║                                                          ║
║  Coste hoy:  \$$_cost_today
║  Límite:     \$$DAILY_LIMIT  (SUBAG_DAILY_LIMIT)
║                                                          ║
║  Para continuar puedes:                                  ║
║    a) Subir el límite:  export SUBAG_DAILY_LIMIT=2.00    ║
║    b) Desactivar guard: export SUBAG_GUARD_TOOLS=""      ║
║    c) Revisar consumo:  python3 scripts/cost_report.py   ║
╚══════════════════════════════════════════════════════════╝
EOF
    exit 2
fi

# Aviso informativo si supera el 80 % del límite (sin bloquear)
_warn="$(python3 -c \
    "print(1 if float('$_cost_today') >= float('$DAILY_LIMIT') * 0.8 else 0)" \
    2>/dev/null || echo "0")"

if [[ "$_warn" -eq 1 ]]; then
    echo "[token-guard] aviso: coste hoy \$$_cost_today — llegando al límite de \$$DAILY_LIMIT" >&2
fi

exit 0
