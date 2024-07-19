import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../Cart.jsx"; // Ensure this path is correct
import Order_Item from "./Order_Item.jsx";

import "../styles/scss/Order_Review.scss";

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

function generateOrderPayload(cart, total, note) {
  const orderItems = cart.map((item) => {
    return {
      itemID: item.id,
      itemName: item.name,
      quantity: item.quantity,
      itemPrice: item.price * item.quantity,
    };
  });

  return JSON.stringify({
    status: "Preparing",
    totalPrice: total,
    note: note,
    cart: orderItems,
  });
}

function addOrderToDB(cart, total, note) {
  fetch("http://localhost:5000/api/kiosk/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: generateOrderPayload(cart, total, note),
  })
    .then((response) => response.json()) // Parse the JSON from the response
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const OrderReview = () => {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const [orderNumber, setOrderNumber] = useState(0);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState("");

  const generateOrderItems = () => {
    return cart.map((item, index) => {
      return (
        <Order_Item
          key={index}
          quantity={item.quantity}
          name={item.name}
          price={item.price * item.quantity}
        />
      );
    });
  };

  const handleNote = (event) => {
    setNote(event.target.value);
  };

  const handleConfirm = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    addOrderToDB(cart, total, note);
    alert("Order confirmed!");
    updateOrderNumber();
    clearCart();
  };

  const handleCancel = () => {
    alert("Order cancelled!");
    clearCart();
  };

  function updateOrderNumber() {
    fetch("http://localhost:5000/api/kiosk/orders/last").then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setOrderNumber(data.order_num + 1);
        });
      }
    });
  }

  useEffect(() => {
    updateOrderNumber();
  });

  useEffect(() => {
    setTotal(getTotal());
  }, [cart]);

  return (
    <div className="review-layout">
      <div className="order">
        <h1>Order #{formatOrderNumber(orderNumber)}</h1>
        <h2>Your Final Order:</h2>
        <div className="order-items">{generateOrderItems()}</div>
        <div className="line"></div>
        <div className="order-total">
          <h5>Total:</h5>
          <h5>$ {total}</h5>
        </div>

        <textarea
          className="order-note"
          value={note}
          onChange={handleNote}
          placeholder="Add a note for the order"
        />
        <div className="order-buttons">
          <button className="order-buttons-confirm" onClick={handleConfirm}>
            <img src="/Star.png" alt="checkout" />
            Confirm
          </button>
          <button className="order-buttons-cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
