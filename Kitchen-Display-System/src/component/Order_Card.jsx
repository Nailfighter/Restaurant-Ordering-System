import React, { useEffect, useState } from "react";
import "../styles/Order_Card.scss";
import Card_Buttons from "./Card_Buttons";

const cardColor = {
  Preparing: "#F3B55E",
  Delayed: "#f3726c",
  Completed: "#79BF7F",
};

function convertAndAdjustDate(dateString) {
  const isoDateString = dateString.replace(" ", "T");
  let date = new Date(isoDateString);
  date.setHours(date.getHours() + -4);
  return date;
}

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

const OrderCard = ({ order, items }) => {
  const createTime = convertAndAdjustDate(order.created_time);
  const [elapsedTime, setElapsedTime] = useState("0:00");
  const color = cardColor[order.status];

  useEffect(() => {
    const interval = setInterval(() => {
      const curTime = new Date();
      const elapsed = Math.floor((curTime - createTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [createTime]);

  return (
    <div className="order">
      <div className="order-number" style={{ backgroundColor: color }}>
        <h3>#{formatOrderNumber(order.order_num)}</h3>
      </div>
      <div className="order-time">
        <h4>{createTime.toLocaleTimeString()}</h4>
        {order.status !== "Completed" && <h4>{elapsedTime}</h4>}
      </div>
      <div className="order-content">
        {items.map((item, index) => (
          <h5 key={index}>
            {item.quantity} x {item.item_name}
          </h5>
        ))}
        {order.note && (
          <div className="order-note">
            <div className="order-note-sep"></div>
            <h5>Notes: {order.note}</h5>
          </div>
        )}

        <Card_Buttons
          key={order.order_num}
          orderNum={order.order_num}
          status={order.status}
        />
      </div>
    </div>
  );
};

export default OrderCard;
