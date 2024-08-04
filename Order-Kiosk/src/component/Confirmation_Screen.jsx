import React, { useState, useContext, useEffect } from "react";
import { ConfirmationContext } from "../ConfirmationContext.jsx";

const apiURL = import.meta.env.VITE_API_URL;

function formatOrderNumber(orderNumber) {
  return orderNumber.toString().padStart(3, "0");
}

const ConfirmationScreen = () => {
  const [orderNumber, setOrderNumber] = useState(0);
  const { showConfirmation } = useContext(ConfirmationContext);

  useEffect(() => {
    const fetchOrderNumber = async () => {
      try {
        const response = await fetch(apiURL + "/api/kiosk/orders/last");
        if (response.ok) {
          const data = await response.json();
          if (data.order_num == null) {
            setOrderNumber(0);
          } else {
            setOrderNumber(data.order_num);
          }
        } else {
          console.error("Failed to fetch order number");
        }
      } catch (error) {
        console.error("Error fetching order number:", error);
      }
    };

    fetchOrderNumber();
  }, [showConfirmation]);

  return (
    <div
      className="overlay"
      style={showConfirmation ? { display: "flex" } : { display: "none" }}
    >
      <div className="ticket">
        <h1>Your Order Number is</h1>
        <h3>#{formatOrderNumber(orderNumber)}</h3>{" "}
        <h2>Keep calm while we prepare your order</h2>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
