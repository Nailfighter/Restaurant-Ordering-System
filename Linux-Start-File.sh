gnome-terminal -- bash -c "cd $(dirname "$0")/Order-Kiosk && npm run dev; exec bash"
gnome-terminal -- bash -c "cd $(dirname "$0")/Kitchen-Display-System && npm run dev; exec bash"
gnome-terminal -- bash -c "cd $(dirname "$0")/Server && npm run dev; exec bash"
