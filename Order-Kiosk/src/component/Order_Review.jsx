import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../Cart.jsx"; // Ensure this path is correct
import Order_Item from "./Order_Item.jsx";

import "../styles/scss/Order_Review.scss";

const OrderReview = () => {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const [total, setTotal] = useState(0);

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

  const handleConfirm = () => {
    alert("Order confirmed!");
    clearCart();
  };

  const handleCancel = () => {
    alert("Order cancelled!");
    clearCart();
  };

  useEffect(() => {
    setTotal(getTotal());
  }, [cart]);

  return (
    <div className="review-layout">
      <div className="order">
        <h1>Order #047</h1>
        <h2>Your Final Order:</h2>
        <div className="order-items">{generateOrderItems()}</div>
        <div className="line"></div>
        <div className="order-total">
          <h5>Total:</h5>
          <h5>$ {total}</h5>
        </div>

        <textarea
          className="order-note"
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
