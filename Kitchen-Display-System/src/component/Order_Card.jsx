import React, { useEffect, useState } from "react";
import "../styles/Order_Card.scss";
import Card_Buttons from "./Card_Buttons";

function convertAndAdjustDate(dateString) {
  const isoDateString = dateString.replace(" ", "T");
  let date = new Date(isoDateString);
  date.setHours(date.getHours());
  return date;
}

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

function formatTime(time) {
  return time.slice(0, -6) + time.slice(-3);
}

const OrderCard = ({ order, items }) => {
  const createTime = convertAndAdjustDate(order.created_time);
  const [elapsedTime, setElapsedTime] = useState("0:00");

  const returnHeader = (status) => {
    function underMinute() {
      const curTime = new Date();
      const elapsed = Math.floor((curTime - createTime) / 1000);
      return elapsed < 60;
    }

    switch (status) {
      case "Preparing":
        return underMinute() ? "order-header-Starting" : "order-header-Preparing";
      case "Delayed":
        return "order-header-Delayed";
      case "Completed":
        return "order-header-Completed";
    }
  };

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
      <div className={returnHeader(order.status)}>
        <div className="order-header-info">
          <h2># {formatOrderNumber(order.order_num)}</h2>
          <div className="order-header-time">
            <h6>{formatTime(createTime.toLocaleTimeString())}</h6>
          </div>
        </div>
        {/* <div className="line"></div> */}
        {order.note && (
          <div className="order-header-note">
            <h5>Note :</h5>
            <span>{order.note}</span>
          </div>
        )}
        <div className="order-row">
          <div className="order-timer">{elapsedTime}</div>
        </div>
      </div>

      <div className="order-body">
        <div className="order-body-items">
          {items.map((item, index) => (
            <div
              className="order-body-item"
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#ebebeb" : "#ffffff",
              }}
            >
              <h3>{item.quantity}x</h3>
              <h4>{item.item_name}</h4>
            </div>
          ))}
        </div>
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
