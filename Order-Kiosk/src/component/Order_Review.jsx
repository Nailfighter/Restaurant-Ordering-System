import React, { useEffect } from "react";
import Order_Item from "./Order_Item.jsx";

import "../styles/scss/Order_Review.scss";

const cart = [];

// Create an object representing the item
const item1 = {
  quantity: 1,
  name: "Chickpea Curry with Rice + Naan Combo",
  price: 20,
};
const item2 = {
  quantity: 2,
  name: "Samosa",
  price: 12,
};

const item3 = {
  quantity: 2,
  name: "Tandoori Chicken",
  price: 24,
};

cart.push(item1);
cart.push(item2);
cart.push(item3);

const itemList = cart.map((item) => (
  <Order_Item quantity={item.quantity} item={item.name} price={item.price} />
));

let total = 80;

const OrderReview = () => {
  return (
    <div className="review-layout">
      <div className="order">
        <h1>Order #047</h1>
        <h2>Your Final Order:</h2>
        <div className="order-items">{itemList}</div>
        <div className="line"></div>
        <div className="order-total">
          <h5>Total:</h5>
          <h5>$ {total}</h5>
        </div>

        <textarea
          className="order-note"
          placeholder="Add a note to the order"
        />
        <div className="order-buttons">
          <button className="order-buttons-confirm">
            <img src="public/Star.png" alt="checkout" />
            Confirm
          </button>
          <button className="order-buttons-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
