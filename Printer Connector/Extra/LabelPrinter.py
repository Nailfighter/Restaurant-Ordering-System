import re
import xml.etree.ElementTree as ET
import asyncio
import websockets
import json
from win32com.client import Dispatch
import sys
import os

curPath = os.path.dirname(os.path.abspath(__file__))
templatePath = curPath + "/OrderTemplate.label"
modifiedTemplateName = curPath + "/ModifiedTemplate.label"

def Format_Order_Number(order_number):
    return str(order_number).zfill(3)


def On_Message_Received(order_num, order_info):
    order_items = "\n".join(
        [f"{item['quantity']} x {item['itemName']}" for item in order_info["cart"]])
    Make_Layout(order_num, order_items)
    Print_Label()


def Print_Label():
    myPrinter = "DYMO LabelWriter 450"
    printer_com = Dispatch('Dymo.DymoAddIn')
    label_com = Dispatch('Dymo.DymoLabels')

    layout_path = modifiedTemplateName
    printer_com.selectPrinter(myPrinter)

    if not printer_com.Open(layout_path):
        print("Failed to open the label template.")
        sys.exit(1)

    printer_com.StartPrintJob()
    printer_com.Print(1, False)
    printer_com.EndPrintJob()

    print()
    print("Printing completed.")


def Make_Layout(order_num, order_items):
    with open(templatePath, 'r', encoding='utf-8') as file:
        content = file.read()

    content = content.replace(
        '<String>Header</String>', f'<String>{"Order #"+order_num}</String>')
    content = content.replace('<String>Body</String>',
                              f'<String>{order_items}</String>')

    with open(modifiedTemplateName, 'w', encoding='utf-8') as file:
        print("Etite")
        file.write(content)
