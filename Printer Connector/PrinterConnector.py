import sys
import asyncio
import websockets
import json
import socket
import os

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QVBoxLayout,
    QWidget, QHBoxLayout, QLabel, QCheckBox, QPushButton,
    QDialog, QComboBox, QFormLayout, QTableWidget,
    QTableWidgetItem, QSpinBox, QHeaderView,
    QMessageBox
)
from PyQt6.QtCore import QThread, pyqtSignal, QObject, QUrl
from PyQt6.QtGui import QFont
from PyQt6.QtMultimedia import QSoundEffect
from websockets.exceptions import WebSocketException, ConnectionClosed

import Extra.LabelPrinter as LabelPrinter


def print_label(order_data):
    LabelPrinter.On_Message_Received(
        LabelPrinter.Format_Order_Number(order_data["orderNum"]),
        order_data["order"]
    )


Food_Name = [
    "Chicken Box",
    "Panner Box",
    "Chickpea Box",
    "Tandoori Chicken",
    "Extra Rice/Naan",
    "Chicken Combo",
    "Panner Combo",
    "Chickpea Combo",
    "Tandoori Combo",
    "Samosa",
    "Mango Lassi",
    "Water",
    "Soda",
]


class ManualOrderDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Manual Order Entry")
        self.setMinimumSize(400, 400)

        # Order number input
        self.order_num_input = QSpinBox()
        self.order_num_input.setMinimum(1)
        self.order_num_input.setMaximum(999999)

        # Item name dropdown instead of QLineEdit
        self.item_name_input = QComboBox()
        self.item_name_input.addItems(Food_Name)

        # Quantity input
        self.quantity_input = QSpinBox()
        self.quantity_input.setMinimum(1)
        self.quantity_input.setMaximum(1000)

        self.add_item_button = QPushButton("Add Item")
        self.add_item_button.clicked.connect(self.add_item)

        # Table to show added items (no price column)
        self.items_table = QTableWidget(0, 2)
        self.items_table.setHorizontalHeaderLabels(["Item Name", "Quantity"])
        self.items_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)

        form_layout = QFormLayout()
        form_layout.addRow("Order Number:", self.order_num_input)
        form_layout.addRow("Item Name:", self.item_name_input)
        form_layout.addRow("Quantity:", self.quantity_input)
        form_layout.addRow(self.add_item_button)
        form_layout.addRow(self.items_table)

        # Buttons at the bottom
        self.submit_button = QPushButton("Print Order")
        self.submit_button.clicked.connect(self.accept)

        self.cancel_button = QPushButton("Cancel")
        self.cancel_button.clicked.connect(self.reject)

        buttons_layout = QHBoxLayout()
        buttons_layout.addWidget(self.submit_button)
        buttons_layout.addWidget(self.cancel_button)

        main_layout = QVBoxLayout(self)
        main_layout.addLayout(form_layout)
        main_layout.addLayout(buttons_layout)

        self.cart = []

    def add_item(self):
        name = self.item_name_input.currentText()
        qty = self.quantity_input.value()

        if not name:
            QMessageBox.warning(self, "Input Error", "Item name cannot be empty.")
            return

        item_id = len(self.cart) + 1  # simple increment id
        item = {
            "itemID": item_id,
            "itemName": name,
            "quantity": qty,
            "itemPrice": 0,
        }
        self.cart.append(item)

        # Add row to table (only name and quantity)
        row = self.items_table.rowCount()
        self.items_table.insertRow(row)
        self.items_table.setItem(row, 0, QTableWidgetItem(name))
        self.items_table.setItem(row, 1, QTableWidgetItem(str(qty)))

        # Reset quantity to 1 (optional)
        self.quantity_input.setValue(1)

    def get_order_data(self):
        if not self.cart:
            QMessageBox.warning(self, "Input Error", "Add at least one item to the cart.")
            return None

        return {
            "orderNum": self.order_num_input.value(),
            "order": {
                "status": "Preparing",
                "totalPrice": 0,
                "note": "",
                "cart": self.cart,
            }
        }


class WebSocketWorker(QObject):
    log_message = pyqtSignal(str)
    new_order = pyqtSignal(dict)
    connection_status_changed = pyqtSignal(str)

    def __init__(self, uri):
        super().__init__()
        self.uri = uri
        self._is_running = True
        self.loop = None

    def stop(self):
        if self._is_running:
            self.log_message.emit("🛑 Shutdown requested. Stopping worker...")
            self._is_running = False
            if self.loop and self.loop.is_running():
                for task in asyncio.all_tasks(self.loop):
                    task.cancel()
                self.loop.call_soon_threadsafe(self.loop.stop)

    async def listen_async(self):
        reconnect_delay = 5
        while self._is_running:
            try:
                self.connection_status_changed.emit("CONNECTING")
                self.log_message.emit(f"🔌 Attempting to connect to {self.uri}...")

                async with websockets.connect(
                    self.uri,
                    ping_interval=10,
                    ping_timeout=10
                ) as websocket:
                    self.connection_status_changed.emit("CONNECTED")
                    self.log_message.emit(f"✅ Connection successful to {self.uri}")

                    await websocket.send(json.dumps({"type": "REGISTER_CLIENT"}))
                    self.log_message.emit("-----------------------------")

                    while self._is_running:
                        try:
                            message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                            try:
                                data = json.loads(message)
                                if data.get("type") == "NEW_ORDER":
                                    self.new_order.emit(data)
                                else:
                                    self.log_message.emit(f"📥 Received: {data}")
                            except json.JSONDecodeError:
                                self.log_message.emit(f"⚠️ Received malformed JSON: {message}")
                        except asyncio.TimeoutError:
                            continue
                        except ConnectionClosed:
                            self.log_message.emit("ℹ️ Connection closed by server or network issue.")
                            break

            except (ConnectionRefusedError, socket.gaierror, OSError, WebSocketException) as e:
                if self._is_running:
                    self.log_message.emit(f"❌ Connection error: {type(e).__name__}")
                    self.connection_status_changed.emit("ERROR")

            except Exception as e:
                if self._is_running:
                    self.log_message.emit(f"❌ Unexpected error: {type(e).__name__} - {e}")
                    self.connection_status_changed.emit("ERROR")

            if self._is_running:
                self.log_message.emit("⚠️ Connection lost.")
                self.connection_status_changed.emit("DISCONNECTED")
                self.log_message.emit(f"⏳ Reconnecting in {reconnect_delay} seconds...")
                await asyncio.sleep(reconnect_delay)

    def run(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        try:
            self.loop.run_until_complete(self.listen_async())
        except Exception as e:
            self.log_message.emit(f"FATAL: Asyncio loop crashed: {e}")
        finally:
            self.loop.close()
            self.log_message.emit("ℹ️ WebSocket worker has finished.")
            self.connection_status_changed.emit("STOPPED")


class MainWindow(QMainWindow):
    stop_worker_signal = pyqtSignal()

    def __init__(self, uri, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Printer Connector")
        self.setGeometry(100, 100, 800, 350)

        self.status_indicator = QLabel()
        self.status_indicator.setFixedSize(15, 15)

        self.status_text = QLabel("Initializing...")
        font = self.status_text.font()
        font.setPointSize(10)
        self.status_text.setFont(font)

        self.logs_label = QLabel("Logs")
        font = self.logs_label.font()
        font.setBold(True)
        self.logs_label.setFont(font)

        self.log_display = QTextEdit()
        self.log_display.setReadOnly(True)
        self.log_display.setStyleSheet(
            "background-color: #2b2b2b; color: #f0f0f0; font-family: Consolas, monaco, monospace;"
        )

        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        status_layout = QHBoxLayout()
        status_layout.addWidget(QLabel("Status:"))
        status_layout.addWidget(self.status_indicator)
        status_layout.addWidget(self.status_text)
        status_layout.addStretch()

        # Audio toggle checkbox
        self.audio_checkbox = QCheckBox("🔕 Disable Audio")
        self.audio_checkbox.setChecked(False)  # Audio enabled by default
        self.audio_checkbox.stateChanged.connect(self.toggle_audio)
        status_layout.addWidget(self.audio_checkbox)

        # Manual Print button
        self.manual_print_button = QPushButton("Manual Print")
        self.manual_print_button.clicked.connect(self.open_manual_print_dialog)
        status_layout.addWidget(self.manual_print_button)

        main_layout = QVBoxLayout(central_widget)
        main_layout.addLayout(status_layout)
        main_layout.addWidget(self.logs_label)
        main_layout.addWidget(self.log_display)

        # Sound effect for disconnection
        self.disconnect_sound = QSoundEffect()
        self.disconnect_sound.setSource(QUrl.fromLocalFile(os.path.abspath("Extra/disconnect.wav")))
        self.disconnect_sound.setVolume(0.5)
        self.audio_enabled = True

        self.worker_thread = QThread()
        self.worker = WebSocketWorker(uri)
        self.worker.moveToThread(self.worker_thread)

        self.worker.log_message.connect(self.append_log)
        self.worker.new_order.connect(self.display_order)
        self.worker.connection_status_changed.connect(self.update_connection_status)

        self.worker_thread.started.connect(self.worker.run)
        self.stop_worker_signal.connect(self.worker.stop)
        self.worker_thread.finished.connect(self.worker_thread.deleteLater)

        self.update_connection_status("CONNECTING")
        self.worker_thread.start()

    def toggle_audio(self, state):
        self.audio_enabled = not bool(state)

    def update_connection_status(self, status: str):
        red_style = "background-color: #e74c3c; border-radius: 7px;"
        green_style = "background-color: #2ecc71; border-radius: 7px;"
        yellow_style = "background-color: #f1c40f; border-radius: 7px;"
        gray_style = "background-color: #95a5a6; border-radius: 7px;"

        if status == "CONNECTED":
            self.status_indicator.setStyleSheet(green_style)
            self.status_text.setText("Connected")
        elif status == "CONNECTING":
            self.status_indicator.setStyleSheet(yellow_style)
            self.status_text.setText("Connecting...")
        elif status in ["DISCONNECTED", "ERROR"]:
            self.status_indicator.setStyleSheet(red_style)
            self.status_text.setText("Disconnected")
            if self.audio_enabled and self.disconnect_sound.isLoaded():
                self.disconnect_sound.play()
        elif status == "STOPPED":
            self.status_indicator.setStyleSheet(gray_style)
            self.status_text.setText("Stopped")

    def append_log(self, message: str):
        self.log_display.append(message)

    def display_order(self, order_data: dict):
        try:
            log_entry = f"🧾 Order No. {order_data.get('orderNum', 'N/A')} Received"
            self.log_display.append(log_entry)
            print_label(order_data)
        except Exception as e:
            self.append_log(f"Error displaying order: {e}")

    def open_manual_print_dialog(self):
        dialog = ManualOrderDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            order_data = dialog.get_order_data()
            if order_data:
                self.append_log(f"🖨️ Manually printing order #{order_data['orderNum']}")
                print_label(order_data)

    def closeEvent(self, event):
        self.append_log("Application closing, stopping worker thread...")
        self.stop_worker_signal.emit()
        self.worker_thread.quit()
        if not self.worker_thread.wait(2000):
            self.append_log("Warning: Worker thread did not stop gracefully.")
        super().closeEvent(event)


if __name__ == "__main__":
    uri = "wss://api.osafood.shop/"
    app = QApplication(sys.argv)
    window = MainWindow(uri)
    window.show()
    sys.exit(app.exec())
