import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../Cart.jsx";
import Order_Item from "./Order_Item.jsx";
import { ConfirmationContext } from "../ConfirmationContext.jsx";

import "../styles/scss/Order_Review.scss";

const apiURL = import.meta.env.VITE_API_URL;

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
  fetch(apiURL + "/api/kiosk/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: generateOrderPayload(cart, total, note),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const OrderReview = () => {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState("");

  const { setShowConfirmation } = useContext(ConfirmationContext);

  const generateOrderItems = () => {
    if (cart.length === 0) {
      return <span className="empty-cart">Cart is empty</span>;
    }

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
    setNote("");
    clearCart();
    handleScreen();
  };

  const handleCancel = () => {
    clearCart();
  };

  const handleScreen = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 5000);
  };

  useEffect(() => {
    setTotal(getTotal());
  }, [cart]);

  return (
    <div className="order">
      <h1>Current Order</h1>
      <div className="order-items">{generateOrderItems()}</div>
      <div className="footer">
        <div className="footer-top">
          <img src="./Image/Dash.png" alt="Dash Line" />
          <div className="total">
            <span>Total</span>
            <h5>$ {total}</h5>
          </div>
        </div>
        <textarea
          className="note"
          value={note}
          onChange={handleNote}
          placeholder="Add a note..."
        ></textarea>
        <div className="buttons">
          <button className="buttons-cancel" onClick={handleCancel}>
            <img src="./Icon/Undo.png" alt="Cancel" />
          </button>
          <button className="buttons-confirm" onClick={handleConfirm}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
