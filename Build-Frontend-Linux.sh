#!/bin/bash

set -e  # Exit on error
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Installing dependencies for Order-Kiosk..."
cd "$BASE_DIR/Order-Kiosk"
npm install
echo "🔧 Building Order-Kiosk..."
npm run build

echo "📦 Installing dependencies for Kitchen-Display-System..."
cd "$BASE_DIR/Kitchen-Display-System"
npm install
echo "🔧 Building Kitchen-Display-System..."
npm run build

echo "📦 Installing dependencies for Dashboard..."
cd "$BASE_DIR/Dashboard"
npm install
echo "🔧 Building Dashboard..."
npm run build

echo "📁 Creating Frontend folder..."
FRONTEND_DIR="$BASE_DIR/Frontend"
mkdir -p "$FRONTEND_DIR"

echo "🚚 Moving and renaming dist folders..."
rm -rf "$FRONTEND_DIR/Order-Kiosk" "$FRONTEND_DIR/Kitchen-Display-System" "$FRONTEND_DIR/Dashboard"
mv "$BASE_DIR/Order-Kiosk/dist" "$FRONTEND_DIR/Order-Kiosk"
mv "$BASE_DIR/Kitchen-Display-System/dist" "$FRONTEND_DIR/Kitchen-Display-System"
mv "$BASE_DIR/Dashboard/dist" "$FRONTEND_DIR/Dashboard"

echo "🔒 Setting permissions for NGINX..."
sudo chown -R www-data:www-data "$FRONTEND_DIR"
sudo chmod -R 755 "$FRONTEND_DIR"

echo "✅ All builds complete and served files are ready in Frontend/"
