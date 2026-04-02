#!/bin/sh

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

# Store all child process PIDs
pids=""

# ---------- Cleanup Function ----------
# Gracefully stop all services
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."

    # Send SIGTERM to all processes
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            echo "   Stopping process $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done

    # Wait up to 5 seconds
    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done

            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Force killing process $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done

    echo "✅ All services stopped"
    exit 0
}

echo "🚀 Starting all services..."
echo ""

# Move to build directory
cd "$BUILD_DIR" || exit 1

# Show files (debug)
ls -lah

# ---------- Database Initialization ----------
if [ -d "./next-service-dist/db" ] && [ "$(ls -A ./next-service-dist/db 2>/dev/null)" ] && [ -d "/db" ]; then
    echo "🗄️ Initializing database from ./next-service-dist/db to /db..."
    cp -r ./next-service-dist/db/* /db/ 2>/dev/null || echo "  ⚠️ Could not copy to /db, skipping database init"
    echo "✅ Database initialization complete"
fi

# ---------- Start Next.js Server ----------
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Starting Next.js server..."
    cd next-service-dist/ || exit 1

    # Environment variables
    export NODE_ENV=production
    export PORT=${PORT:-3000}
    export HOSTNAME=${HOSTNAME:-0.0.0.0}

    # Run in background
    bun server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"

    sleep 1
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Failed to start Next.js server"
        exit 1
    else
        echo "✅ Next.js server started (PID: $NEXT_PID, Port: $PORT)"
    fi

    cd ../
else
    echo "⚠️ Next.js server file not found: ./next-service-dist/server.js"
fi

# ---------- Start Mini Services ----------
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Starting mini-services..."

    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"

    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️ mini-services may have failed to start, continuing..."
    else
        echo "✅ mini-services started (PID: $MINI_PID)"
    fi

elif [ -d "./mini-services-dist" ]; then
    echo "⚠️ mini-services directory exists but start script not found"
else
    echo "ℹ️ mini-services not found, skipping"
fi

# ---------- Start Caddy ----------
echo "🚀 Starting Caddy..."

echo "✅ Caddy started (running in foreground)"
echo ""
echo "🎉 All services are up and running!"
echo ""
echo "💡 Press Ctrl+C to stop all services"
echo ""

# Run Caddy as main process
exec caddy run --config Caddyfile --adapter caddyfile

# Cleanup on exit
trap cleanup INT TERM EXIT