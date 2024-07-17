import React from "react";
import Tag from "./Tag.jsx";
import QuantitySelector from "./Quantiy_Selector.jsx";

import "../styles/scss/Food_Card.scss";

const FoodCard = () => {
  return (
    <div className="card">
      <div className="card-image">
        <img src="public/chicken-tikka-masala.jpg" alt="food" />
      </div>
      <div className="card-content">
        <h3>Chicken Curry with Rice + Naan</h3>
        <div className="card-content-tags">
          <Tag text="Spicy" />
          <Tag text="Diary" />
        </div>
        <div className="card-content-price">
          <h4>$</h4>
          <h4>12</h4>
        </div>
        <p>
          Tender pieces of chicken marinated in a blend of yogurt and spices,
          then grilled to perfection and simmered in a rich, creamy tomato
          sauce. This dish is a harmonious fusion of aromatic spices, tangy
          flavors, and a hint of sweetness, making it a favorite among Indian
          cuisine lovers
        </p>
        <QuantitySelector />
      </div>
    </div>
  );
};

export default FoodCard;
