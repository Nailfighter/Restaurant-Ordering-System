import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
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
          setOrderNumber(data.order_num ?? 0);
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
      style={{ display: showConfirmation ? "flex" : "none" }}
    >
      <motion.div
        className="ticket"
        initial={{ opacity: 0, scale: 0.5, y: 50 }} 
        animate={{
          opacity: showConfirmation ? 1 : 0,
          scale: showConfirmation ? 1.1 : 0.5,
          y: showConfirmation ? 0 : 50,
        }} 
        transition={{
          duration: 0.6,
          ease: "easeOut",
          type: "spring",
          stiffness: 300,
          damping: 10,
        }} 
      >
        <h1>Your Order Number is</h1>
        <h3>#{formatOrderNumber(orderNumber)}</h3>
        <h2>Keep calm while we prepare your order</h2>
      </motion.div>
    </div>
  );
};

export default ConfirmationScreen;
