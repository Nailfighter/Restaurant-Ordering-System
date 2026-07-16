import React, { useContext, useState } from "react";
import { CartContext } from "../Cart.jsx";
import { motion } from "framer-motion";

import "../styles/scss/Quantity_Selector.scss";

const QuantitySelector = (props) => {
  const { changeQuantity, getItemQuantity } = useContext(CartContext);
  const curQuantity = getItemQuantity(props.id);

  const [lastSeenQuantity, setLastSeenQuantity] = useState(0);
  const [direction, setDirection] = useState("up");

  if (curQuantity !== lastSeenQuantity) {
    setDirection(curQuantity > lastSeenQuantity ? "up" : "down");
    setLastSeenQuantity(curQuantity);
  }

  const handleIncrease = () => {
    const item = {
      id: props.id,
      name: props.name,
      alias: props.alias,
      price: props.price,
    };
    changeQuantity(item, 1);
  };

  const handleDecrease = () => {
    const item = {
      id: props.id,
      name: props.name,
      alias: props.alias,
      price: props.price,
    };
    changeQuantity(item, -1);
  };

  return (
    <div className="button">
      <motion.button
        className="button-less"
        onClick={handleDecrease}
        aria-label={`Remove one ${props.name}`}
        whileTap={{ scale: 0.8 }}
      >
        <img src="Icon/Minus.png" alt="" aria-hidden="true" />
      </motion.button>
      <motion.span
        className="quantity-text"
        key={curQuantity}
        initial={{
          y: direction === "up" ? 10 : -10,
          opacity: 0,
        }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {curQuantity}
      </motion.span>
      <motion.button
        className="button-more"
        onClick={handleIncrease}
        aria-label={`Add one ${props.name}`}
        whileTap={{ scale: 1.2 }}
      >
        <img src="Icon/Plus.png" alt="" aria-hidden="true" />
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
