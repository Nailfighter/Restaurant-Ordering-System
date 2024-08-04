import React from "react";
import "../styles/scss/Order_Review.scss";

const OrderItem = (props) => {
  return (
    <div className="order-item">
      <div className="order-header">
        <h3 className="order-name">{props.name}</h3>
        <span className="order-quantity">{props.quantity}x</span>
      </div>
      <h5 className="order-price">${props.price}</h5>
    </div>
  );
};

export default OrderItem;
