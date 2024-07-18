import React from "react";
import "../styles/scss/Order_Review.scss";

const OrderItem = (props) => {
  return (
    <div className="order-item">
      <div className="order-label">
        <h6 className="order-quantity">{props.quantity}x</h6>
        <h6 className="order-name">{props.name}</h6>
      </div>
      <h6 className="order-price">${props.price}</h6>
    </div>
  );
};

export default OrderItem;
