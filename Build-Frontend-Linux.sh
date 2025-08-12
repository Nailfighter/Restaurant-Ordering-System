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

# Standard Nginx web root on Fedora
NGINX_ROOT="/usr/share/nginx/html"

echo "📁 Creating directories in $NGINX_ROOT..."
sudo mkdir -p "$NGINX_ROOT/Order-Kiosk" "$NGINX_ROOT/Kitchen-Display-System" "$NGINX_ROOT/Dashboard"

echo "🚚 Moving and renaming dist folders to $NGINX_ROOT..."
sudo rm -rf "$NGINX_ROOT/Order-Kiosk" "$NGINX_ROOT/Kitchen-Display-System" "$NGINX_ROOT/Dashboard"
sudo mv "$BASE_DIR/Order-Kiosk/dist" "$NGINX_ROOT/Order-Kiosk"
sudo mv "$BASE_DIR/Kitchen-Display-System/dist" "$NGINX_ROOT/Kitchen-Display-System"
sudo mv "$BASE_DIR/Dashboard/dist" "$NGINX_ROOT/Dashboard"

echo "🔒 Setting ownership and permissions for NGINX..."
sudo chown -R nginx:nginx "$NGINX_ROOT/Order-Kiosk" "$NGINX_ROOT/Kitchen-Display-System" "$NGINX_ROOT/Dashboard"
sudo chmod -R 755 "$NGINX_ROOT/Order-Kiosk" "$NGINX_ROOT/Kitchen-Display-System" "$NGINX_ROOT/Dashboard"

echo "🔒 Setting SELinux permissions for NGINX..."
sudo semanage fcontext -a -t httpd_sys_content_t "/usr/share/nginx/html(/.*)?"
sudo restorecon -Rv /usr/share/nginx/html

echo "✅ All builds complete and served files are ready in $NGINX_ROOT/"
