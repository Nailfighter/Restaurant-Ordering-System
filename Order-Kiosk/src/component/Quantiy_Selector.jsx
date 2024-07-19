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
    <div className="card-content-buttons">
      <div className="quantity">
        <button onClick={handleDecrease}>
          <img src="/Minus.png" alt="minus" />
        </button>
        <span>{curQuantity}</span>
        <button onClick={handleIncrease}>
          <img src="/Plus.png" alt="plus" />
        </button>
      </div>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default QuantitySelector;
