import React from "react";
import { motion } from "framer-motion";
import "../styles/scss/Order_Review.scss";

const OrderItem = (props) => {
  return (
    <motion.div
      className="order-item"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <motion.div
        className="order-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <h3 className="order-name">{props.name}</h3>
        <span className="order-quantity">{props.quantity}x</span>
      </motion.div>
      <motion.h5
        className="order-price"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        ${props.price}
      </motion.h5>
    </motion.div>
  );
};

export default OrderItem;
