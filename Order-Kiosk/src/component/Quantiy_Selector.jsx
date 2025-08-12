import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../Cart.jsx"; // Ensure this path is correct
import { motion } from "framer-motion";

import "../styles/scss/Quantiy_Selector.scss";

const QuantitySelector = (props) => {
  const [curQuantity, setQuantity] = useState(0);
  const [prevQuantity, setPrevQuantity] = useState(0);

  const handleIncrease = () => {
    setPrevQuantity(curQuantity);
    setQuantity(curQuantity + 1);
  };

  const handleDecrease = () => {
    if (curQuantity > 0) {
      setPrevQuantity(curQuantity);
      setQuantity(curQuantity - 1);
    }
  };

  const { cart, addToCart, clearCart } = useContext(CartContext);

  useEffect(() => {
    const cartLength = cart.length;
    if (cartLength === 0) {
      setQuantity(0);
    }
  }, [clearCart]);

  useEffect(() => {
    handleAdd();
  }, [curQuantity]);

  const handleAdd = () => {
    const itemWithQuantity = {
      id: props.id,
      name: props.name,
      alias: props.alias,
      price: props.price,
      quantity: curQuantity,
    };
    addToCart(itemWithQuantity);
  };

  return (
    <div className="button">
      <motion.button
        className="button-less"
        onClick={handleDecrease}
        whileTap={{ scale: 0.8 }}
      >
        <img src="Icon/Minus.png" alt="minus" />
      </motion.button>
      <motion.span
        className="quantity-text"
        key={curQuantity}
        initial={{
          y: curQuantity > prevQuantity ? 10 : -10,
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
        whileTap={{ scale: 1.2 }}
      >
        <img src="Icon/Plus.png" alt="plus" />
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
