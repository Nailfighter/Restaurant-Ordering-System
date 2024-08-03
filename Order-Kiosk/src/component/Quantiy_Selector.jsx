import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../Cart.jsx"; // Ensure this path is correct

import "../styles/scss/Quantiy_Selector.scss";

const QuantitySelector = (props) => {
  const [curQuantity, setQuantity] = useState(0);
  const handleIncrease = () => {
    setQuantity(curQuantity + 1);
  };

  const handleDecrease = () => {
    if (curQuantity > 0) {
      setQuantity(curQuantity - 1);
    }
  };

  const { cart, addToCart, clearCart } = useContext(CartContext);

  useEffect(() => {
    const cartLenth = cart.length;
    if (cartLenth == 0) {
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
      price: props.price,
      quantity: curQuantity,
    };
    addToCart(itemWithQuantity);
  };

  return (
    <div className="button">
      <button className="button-less" onClick={handleDecrease}>
        <img src="./Icon/Minus.png" alt="minus" />
      </button>
      <span>{curQuantity}</span>
      <button className="button-more" onClick={handleIncrease}>
        <img src="./Icon/Plus.png" alt="plus" />
      </button>
    </div>
  );
};

export default QuantitySelector;
