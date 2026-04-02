#!/bin/bash

set -euo pipefail

# Get script directory (.zscripts)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------- Logging Functions ----------

log_step_start() {
    local step_name="$1"
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
    echo "=========================================="
    export STEP_START_TIME
    STEP_START_TIME=$(date +%s)
}

log_step_end() {
    local step_name="${1:-Unknown step}"
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - STEP_START_TIME))
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
    echo "[LOG] Step: $step_name | Duration: ${duration}s"
    echo "=========================================="
    echo ""
}

# ---------- Start Mini Services ----------

start_mini_services() {
    local mini_services_dir="$PROJECT_DIR/mini-services"
    local started_count=0

    log_step_start "Starting mini-services"

    if [ ! -d "$mini_services_dir" ]; then
        echo "Mini-services directory not found, skipping..."
        log_step_end "Starting mini-services"
        return 0
    fi

    echo "Scanning for mini-services..."

    for service_dir in "$mini_services_dir"/*; do
        if [ ! -d "$service_dir" ]; then
            continue
        fi

        local service_name
        service_name=$(basename "$service_dir")
        echo "Checking service: $service_name"

        # Check for package.json
        if [ ! -f "$service_dir/package.json" ]; then
            echo "[$service_name] No package.json found, skipping..."
            continue
        fi

        # Check for dev script
        if ! grep -q '"dev"' "$service_dir/package.json"; then
            echo "[$service_name] No dev script found, skipping..."
            continue
        fi

        echo "Starting $service_name in background..."

        (
            cd "$service_dir"
            echo "[$service_name] Installing dependencies..."
            bun install
            echo "[$service_name] Running dev server..."
            exec bun run dev
        ) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

        local service_pid=$!
        echo "[$service_name] Started (PID: $service_pid)"
        echo "[$service_name] Logs: $PROJECT_DIR/.zscripts/mini-service-${service_name}.log"

        disown "$service_pid" 2>/dev/null || true
        started_count=$((started_count + 1))
    done

    echo "Mini-services started: $started_count service(s)"
    log_step_end "Starting mini-services"
}

# ---------- Wait for Service ----------

wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local max_attempts="${4:-60}"
    local attempt=1

    echo "Waiting for $service_name at $host:$port..."

    while [ "$attempt" -le "$max_attempts" ]; do
        if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
            echo "$service_name is ready!"
            return 0
        fi

        echo "Attempt $attempt/$max_attempts: Not ready yet..."
        sleep 1
        attempt=$((attempt + 1))
    done

    echo "ERROR: $service_name failed to start within $max_attempts seconds"
    return 1
}

# ---------- Cleanup ----------

cleanup() {
    if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
        echo "Stopping Next.js dev server (PID: $DEV_PID)..."
        kill "$DEV_PID" >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT INT TERM

# ---------- Main Execution ----------

cd "$PROJECT_DIR"

# Check if bun is installed
if ! command -v bun >/dev/null 2>&1; then
    echo "ERROR: bun is not installed or not in PATH"
    exit 1
fi

# Install dependencies
log_step_start "bun install"
echo "[BUN] Installing dependencies..."
bun install
log_step_end "bun install"

# Setup database
log_step_start "Database setup"
echo "[BUN] Running database migration..."
bun run db:push
log_step_end "Database setup"

# Start Next.js dev server
log_step_start "Start Next.js dev server"
echo "[BUN] Starting development server..."
bun run dev &
DEV_PID=$!
log_step_end "Start Next.js dev server"

# Wait for server
log_step_start "Wait for Next.js server"
wait_for_service "localhost" "3000" "Next.js dev server"
log_step_end "Wait for Next.js server"

# Health check
log_step_start "Health check"
echo "[BUN] Performing health check..."
curl -fsS localhost:3000 >/dev/null
echo "[BUN] Health check passed"
log_step_end "Health check"

# Start mini-services
start_mini_services

echo "Next.js dev server is running (PID: $DEV_PID)"
echo "Stop it using: kill $DEV_PID"

disown "$DEV_PID" 2>/dev/null || true
unset DEV_PID