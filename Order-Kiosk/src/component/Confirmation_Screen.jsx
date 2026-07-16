import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ConfirmationContext } from "../ConfirmationContext.jsx";

function formatOrderNumber(orderNumber) {
  if (orderNumber == null) return "000";
  return orderNumber.toString().padStart(3, "0");
}

const ConfirmationScreen = () => {
  const { showConfirmation, confirmedOrderNumber } = useContext(ConfirmationContext);

  return (
    <div
      className="overlay"
      role="status"
      aria-live="polite"
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
        <h3>#{formatOrderNumber(confirmedOrderNumber)}</h3>
      </motion.div>
    </div>
  );
};

export default ConfirmationScreen;
