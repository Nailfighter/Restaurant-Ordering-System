import React, { useEffect, useState } from "react";

import "../styles/scss/Quantiy_Selector.scss";

const QuantitySelector = () => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleAdd = () => {
    console.log("Item added to cart)");
  };

  return (
    <div className="card-content-buttons">
      <div className="quantity">
        <button onClick={handleDecrease}>
          <img src="public/Minus.png" alt="minus" />
        </button>
        <span>{quantity}</span>
        <button onClick={handleIncrease}>
          <img src="public/Plus.png" alt="minus" />
        </button>
      </div>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default QuantitySelector;
