#!/bin/bash

# Redirect stderr to stdout to avoid errors in execute_command
exec 2>&1

set -e

# Get the directory where this script is located (.zscripts folder)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Path to Next.js project
NEXTJS_PROJECT_DIR="/home/z/my-project"

# Check if Next.js project directory exists
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ Error: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Starting build for Next.js app and mini-services..."
echo "📁 Project path: $NEXTJS_PROJECT_DIR"

# Navigate to project directory
cd "$NEXTJS_PROJECT_DIR" || exit 1

# Disable Next.js telemetry
export NEXT_TELEMETRY_DISABLED=1

# Build directory
BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Creating build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build Next.js app
echo "🔨 Building Next.js app..."
bun run build

# Build mini-services (if present)
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 Building mini-services..."

    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    echo "  - Copying mini-services-start.sh"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️ mini-services folder not found, skipping..."
fi

# Collect build output
echo "📦 Collecting build artifacts into $BUILD_DIR..."

# Copy standalone build
if [ -d ".next/standalone" ]; then
    echo "  - Copying .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

# Copy static files
if [ -d ".next/static" ]; then
    echo "  - Copying .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

# Copy public folder
if [ -d "public" ]; then
    echo "  - Copying public folder"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Run database migration if db exists
if [ "$(ls -A ./db 2>/dev/null)" ]; then
    echo "🗄️ Database detected, running migration..."
    DATABASE_URL=file:$BUILD_DIR/db/custom.db bun run db:push
    echo "✅ Database migration completed"
    ls -lah $BUILD_DIR/db
else
    echo "ℹ️ db folder is empty, skipping migration"
fi

# Copy Caddyfile if exists
if [ -f "Caddyfile" ]; then
    echo "  - Copying Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️ Caddyfile not found, skipping..."
fi

# Copy start script
echo "  - Copying start.sh"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Create tar.gz package
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packaging build into $PACKAGE_FILE..."

cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

echo ""
echo "✅ Build completed successfully!"
echo "📊 Package size:"
ls -lh "$PACKAGE_FILE"