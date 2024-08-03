import React from "react";
import "../styles/scss/Order_Review.scss";

const OrderItem = (props) => {
  return (
    <div className="order-item">
      <div className="order-item-header">
        <h3>{props.name}</h3>
        <span>$ {props.price}</span>
      </div>
      <div className="order-item-quantity">
        <h5>x {props.quantity}</h5>
      </div>
    </div>
  );
};

export default OrderItem;
